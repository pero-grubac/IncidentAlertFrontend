import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Chip, Divider, Fab, IconButton, List, Paper, Skeleton, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import TouchAppRoundedIcon from "@mui/icons-material/TouchAppRounded";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import Brand, { BrandMark } from "../components/Brand";
import BottomSheet from "../components/BottomSheet";
import { sheetHeight } from "../lib/sheet";
import CategoryChip from "../components/CategoryChip";
import EmptyState from "../components/EmptyState";
import IncidentDetailsDialog from "../components/IncidentDetailsDialog";
import IncidentListItem from "../components/IncidentListItem";
import IncidentMap from "../components/map/IncidentMap";
import PlaceSearch from "../components/PlaceSearch";
import RangeFilter from "../components/RangeFilter";
import ReportIncidentDialog from "../components/ReportIncidentDialog";
import SettingsMenu from "../components/SettingsMenu";
import { useIncidents } from "../context/IncidentsContext";
import { useNotify } from "../context/NotificationContext";
import { useCategories } from "../hooks/useCategories";
import { categoryNames } from "../lib/categories";
import { reverseGeocode } from "../lib/geocoding";
import { useT } from "../i18n";

const PANEL_WIDTH = 380;

function locationPath(location) {
  return `/location/${encodeURIComponent(location.name)}`;
}

function PanelSection({ title, children, action }) {
  return (
    <Box sx={{ px: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Box>
  );
}

/** Filters and the list of incidents; the same content in the side panel and in the bottom sheet. */
function PanelBody({ range, selectRange, presentCategories, hiddenCategories, setHiddenCategories, toggleCategory, visible, loading, error, activeIncident, openIncident }) {
  const t = useT();
  return (
    <>
      <Stack spacing={2.5} sx={{ pb: 2 }}>
        <PanelSection title={t("map.period")}>
          <RangeFilter value={range} onChange={selectRange} />
        </PanelSection>

        {presentCategories.length > 0 && (
          <PanelSection
            title={t("map.categories")}
            action={hiddenCategories.length > 0 && <Chip size="small" label={t("map.showAll")} onClick={() => setHiddenCategories([])} variant="outlined" />}
          >
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {presentCategories.map((name) => (
                <CategoryChip key={name} name={name} selected={!hiddenCategories.includes(name)} onClick={() => toggleCategory(name)} />
              ))}
            </Stack>
          </PanelSection>
        )}
      </Stack>

      <Divider />

      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography variant="subtitle2">{t("map.reported")}</Typography>
        {!loading && (
          <Typography variant="caption" color="text.secondary" data-testid="incident-count">
            {t("map.count", { n: visible.length })}
          </Typography>
        )}
      </Stack>

      <Box sx={{ px: 1.25, pb: 1.5, minHeight: 120 }}>
        {error && (
          <Alert severity="error" sx={{ mx: 1.25 }}>
            {error}
          </Alert>
        )}
        {loading &&
          [0, 1, 2, 3].map((i) => (
            <Stack key={i} direction="row" spacing={1.5} sx={{ px: 2, py: 1.25 }}>
              <Skeleton variant="rounded" width={36} height={36} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton width="70%" />
                <Skeleton width="45%" />
              </Box>
            </Stack>
          ))}
        {!loading && !error && visible.length === 0 && (
          <EmptyState compact icon={EventBusyOutlinedIcon} title={t("map.emptyTitle")} description={t("map.emptyText")} />
        )}
        {!loading && (
          <List disablePadding>
            {visible.map((incident, i) => (
              <Box key={incident.id} className="ia-rise" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                <IncidentListItem incident={incident} selected={activeIncident?.id === incident.id} onClick={openIncident} />
              </Box>
            ))}
          </List>
        )}
      </Box>
    </>
  );
}

export default function MapPage() {
  const t = useT();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const notify = useNotify();
  const categories = useCategories();
  const { incidents, range, loading, error, selectRange } = useIncidents();

  const [panelOpen, setPanelOpen] = useState(true);
  const [sheet, setSheet] = useState("half");
  const [hintVisible, setHintVisible] = useState(true);
  const [selection, setSelection] = useState(null);
  const [focus, setFocus] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);
  const [reportPlace, setReportPlace] = useState(null);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const geocodeRequest = useRef(null);

  const presentCategories = useMemo(() => [...new Set(incidents.flatMap(categoryNames))].sort(), [incidents]);

  const visible = useMemo(
    () => (hiddenCategories.length === 0 ? incidents : incidents.filter((i) => categoryNames(i).some((c) => !hiddenCategories.includes(c)))),
    [incidents, hiddenCategories],
  );

  const toggleCategory = (name) =>
    setHiddenCategories((hidden) => (hidden.includes(name) ? hidden.filter((c) => c !== name) : [...hidden, name]));

  // On a phone the sheet steps aside whenever the map itself should be looked at.
  const revealMap = useCallback(() => isMobile && setSheet("peek"), [isMobile]);

  const selectPlace = useCallback(
    (place) => {
      setHintVisible(false);
      setSelection(place);
      setFocus({ latitude: place.latitude, longitude: place.longitude, zoom: 16 });
      revealMap();
    },
    [revealMap],
  );

  const handleMapClick = useCallback(
    async ({ lat, lng }) => {
      setHintVisible(false);
      revealMap();
      geocodeRequest.current?.abort();
      const controller = new AbortController();
      geocodeRequest.current = controller;
      setSelection({ latitude: lat, longitude: lng, name: "", loading: true });
      try {
        setSelection(await reverseGeocode(lat, lng, controller.signal));
      } catch {
        // A newer click replaced this one.
      }
    },
    [revealMap],
  );

  const openIncident = (incident) => {
    setActiveIncident(incident);
    if (incident.location) setFocus({ latitude: incident.location.latitude, longitude: incident.location.longitude, zoom: 14 });
    revealMap();
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      notify(t("map.locateUnsupported"), "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        handleMapClick({ lat: coords.latitude, lng: coords.longitude }).then(() =>
          setFocus({ latitude: coords.latitude, longitude: coords.longitude, zoom: 16 }),
        ),
      () => notify(t("map.locateDenied"), "warning"),
    );
  };

  const body = (
    <PanelBody
      {...{ range, selectRange, presentCategories, hiddenCategories, setHiddenCategories, toggleCategory, visible, loading, error, activeIncident, openIncident }}
    />
  );

  const floating = { position: "absolute", zIndex: 1000, bgcolor: "background.paper", color: "text.primary", "&:hover": { bgcolor: "background.paper" } };

  return (
    <Box sx={{ position: "fixed", inset: 0 }}>
      <IncidentMap
        incidents={visible}
        selection={selection}
        focus={focus}
        activeLocation={activeIncident?.location?.name}
        leftInset={panelOpen && !isMobile ? PANEL_WIDTH + 16 : 0}
        bottomInset={isMobile ? sheetHeight(sheet === "full" ? "half" : sheet) : 0}
        showZoom={!isMobile}
        onMapClick={handleMapClick}
        onReport={(place) => setReportPlace(place)}
        onOpenLocation={(location) => navigate(locationPath(location), { state: { location } })}
      />

      {isMobile ? (
        <BottomSheet
          step={sheet}
          onStepChange={setSheet}
          expandLabel={t("map.expandPanel")}
          collapseLabel={t("map.collapsePanel")}
          header={
            <Stack spacing={1.5} sx={{ px: 2.5, pb: 1.5, flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Brand />
                <SettingsMenu />
              </Stack>
              <PlaceSearch onSelect={selectPlace} />
            </Stack>
          }
        >
          {body}
        </BottomSheet>
      ) : (
        <Paper
          elevation={4}
          className="ia-rise"
          sx={(th) => ({
            position: "absolute",
            zIndex: 1000,
            top: 16,
            left: 16,
            bottom: 16,
            width: PANEL_WIDTH,
            display: panelOpen ? "flex" : "none",
            flexDirection: "column",
            bgcolor: th.palette.surface.glass,
            backdropFilter: "blur(12px)",
            border: `1px solid ${alpha(th.palette.divider, 0.8)}`,
            overflow: "hidden",
          })}
        >
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ p: 2.5, pb: 2 }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Brand />
            </Box>
            <SettingsMenu />
            <Tooltip title={t("map.hidePanel")}>
              <IconButton onClick={() => setPanelOpen(false)} aria-label={t("map.hidePanel")} size="small">
                <ChevronLeftRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <PlaceSearch onSelect={selectPlace} />
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{body}</Box>
        </Paper>
      )}

      {!panelOpen && !isMobile && (
        <Tooltip title={t("map.showPanel")} placement="right">
          <Fab onClick={() => setPanelOpen(true)} aria-label={t("map.showPanel")} sx={{ ...floating, top: 16, left: 16 }}>
            <BrandMark size={32} />
          </Fab>
        </Tooltip>
      )}

      <Tooltip title={t("map.locate")} placement="left">
        <Fab size="medium" onClick={locateMe} aria-label={t("map.locate")} sx={{ ...floating, right: 16, top: 16 }}>
          <MyLocationRoundedIcon />
        </Fab>
      </Tooltip>

      {hintVisible && !selection && (
        <Chip
          icon={<TouchAppRoundedIcon />}
          label={t("map.hint")}
          onDelete={() => setHintVisible(false)}
          className="ia-rise"
          sx={(th) => ({
            position: "absolute",
            zIndex: 1000,
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: { xs: "none", md: "flex" },
            height: 40,
            px: 1,
            bgcolor: alpha(th.palette.text.primary, 0.92),
            color: th.palette.background.default,
            boxShadow: 4,
            "& .MuiChip-icon, & .MuiChip-deleteIcon": { color: alpha(th.palette.background.default, 0.75) },
          })}
        />
      )}

      <IncidentDetailsDialog incident={activeIncident} open={Boolean(activeIncident)} onClose={() => setActiveIncident(null)} />

      <ReportIncidentDialog
        open={Boolean(reportPlace)}
        place={reportPlace}
        categories={categories}
        onClose={() => setReportPlace(null)}
        onReported={() => setSelection(null)}
      />
    </Box>
  );
}
