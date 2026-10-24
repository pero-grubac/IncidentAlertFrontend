import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { Alert, AppBar, Box, Button, Card, Container, Grid2 as Grid, Skeleton, Stack, Toolbar, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import Brand from "../components/Brand";
import CategoryChip from "../components/CategoryChip";
import EmptyState from "../components/EmptyState";
import IncidentCard from "../components/IncidentCard";
import IncidentDetailsDialog from "../components/IncidentDetailsDialog";
import ReportIncidentDialog from "../components/ReportIncidentDialog";
import SettingsMenu from "../components/SettingsMenu";
import { incidentIcon, selectionIcon } from "../components/map/markers";
import { TILE_URL } from "../components/map/tiles";
import { getIncidentsByLocation } from "../api/incidents";
import { errorMessage } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import { categoryNames, categoryStyle, incidentColor } from "../lib/categories";
import { fromNow, isWithin } from "../lib/dates";
import { useT } from "../i18n";

function PlaceMap({ place, color }) {
  return (
    <Box sx={{ height: "100%", minHeight: { xs: 200, md: 280 }, borderRadius: 4, overflow: "hidden", border: 1, borderColor: "divider" }}>
      <MapContainer
        key={`${place.latitude},${place.longitude}`}
        center={[place.latitude, place.longitude]}
        zoom={15}
        style={{ height: "100%", width: "100%", minHeight: "inherit" }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        keyboard={false}
      >
        <TileLayer url={TILE_URL} />
        <Marker position={[place.latitude, place.longitude]} icon={color ? incidentIcon(color) : selectionIcon} interactive={false} />
      </MapContainer>
    </Box>
  );
}

/** How many reports each category has here, as a row of colored counts. */
function CategoryBreakdown({ incidents }) {
  const counts = useMemo(() => {
    const map = new Map();
    for (const name of incidents.flatMap(categoryNames)) map.set(name, (map.get(name) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [incidents]);

  if (!counts.length) return null;
  const total = counts.reduce((sum, [, n]) => sum + n, 0);

  return (
    <Stack spacing={1}>
      <Box sx={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }} aria-hidden>
        {counts.map(([name, n]) => (
          <Box key={name} sx={{ width: `${(n / total) * 100}%`, bgcolor: categoryStyle(name).color }} />
        ))}
      </Box>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
        {counts.map(([name, n]) => (
          <Stack key={name} direction="row" spacing={0.5} alignItems="center">
            <CategoryChip name={name} />
            <Typography variant="body2" fontWeight={700}>
              {n}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export default function LocationPage() {
  const t = useT();
  const { locationName } = useParams();
  const { state } = useLocation();
  const categories = useCategories();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getIncidentsByLocation(locationName)
      .then((data) => !cancelled && setIncidents(data))
      .catch((e) => !cancelled && setError(errorMessage(e, t("errors.place"))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // The message only matters for a failure; reloading on a language switch is not needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationName]);

  // Coordinates come from the map when we navigated here, otherwise from a stored incident.
  const place = useMemo(() => {
    const known = state?.location ?? incidents[0]?.location;
    return known ? { ...known, name: locationName } : null;
  }, [state, incidents, locationName]);

  const present = useMemo(() => [...new Set(incidents.flatMap(categoryNames))].sort(), [incidents]);
  const latest = incidents[0];

  const filtered = useMemo(
    () => incidents.filter((i) => (!category || categoryNames(i).includes(category)) && isWithin(i.dateTime, from, to)),
    [incidents, category, from, to],
  );

  const filtering = Boolean(category || from || to);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={(th) => ({ borderBottom: 1, borderColor: "divider", bgcolor: alpha(th.palette.background.paper, 0.85), backdropFilter: "blur(10px)" })}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Button component={RouterLink} to="/" startIcon={<ArrowBackRoundedIcon />} color="inherit">
            {t("place.back")}
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Brand subtitleKey="brand.placeTagline" />
          </Box>
          <SettingsMenu />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }} className="ia-page" key={locationName}>
        {/* Hero: what this place is, what happens here, and the way to report something. */}
        <Card
          sx={(th) => ({
            p: { xs: 2.5, md: 3.5 },
            mb: 4,
            position: "relative",
            overflow: "hidden",
            background: `radial-gradient(900px 300px at 0% 0%, ${alpha(th.palette.secondary.main, 0.1)}, transparent 60%), ${th.palette.background.paper}`,
          })}
        >
          <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="stretch">
            <Grid size={{ xs: 12, md: place ? 7 : 12 }}>
              <Stack spacing={2} sx={{ height: "100%" }}>
                <Box>
                  <Typography variant="overline" color="secondary">
                    {t("place.overline")}
                  </Typography>
                  <Typography variant="h3" component="h2" sx={{ wordBreak: "break-word", fontSize: { xs: "2rem", md: "2.75rem" } }}>
                    {locationName}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap color="text.secondary">
                  {place && (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <PlaceOutlinedIcon fontSize="small" />
                      <Typography variant="body2">
                        {Number(place.latitude).toFixed(5)}, {Number(place.longitude).toFixed(5)}
                      </Typography>
                    </Stack>
                  )}
                  {latest && (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <ScheduleRoundedIcon fontSize="small" />
                      <Typography variant="body2">{t("place.latest", { when: fromNow(latest.dateTime) })}</Typography>
                    </Stack>
                  )}
                </Stack>

                {loading ? (
                  <Skeleton width={220} height={40} />
                ) : (
                  <Box>
                    <Typography variant="h5" component="p" sx={{ mb: 1.25 }}>
                      {t("place.approved", { n: incidents.length })}
                    </Typography>
                    <CategoryBreakdown incidents={incidents} />
                  </Box>
                )}

                <Box sx={{ flexGrow: 1 }} />
                <Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<AddLocationAltRoundedIcon />}
                    disabled={!place}
                    onClick={() => setReporting(true)}
                  >
                    {t("place.report")}
                  </Button>
                </Box>
              </Stack>
            </Grid>
            {place && (
              <Grid size={{ xs: 12, md: 5 }}>
                <PlaceMap place={place} color={incidents[0] ? incidentColor(incidents[0]) : null} />
              </Grid>
            )}
          </Grid>
        </Card>

        {incidents.length > 0 && (
          <Card sx={{ p: 2, mb: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>
                  {t("place.category")}
                </Typography>
                {present.map((name) => (
                  <CategoryChip key={name} name={name} selected={category === name} onClick={() => setCategory(category === name ? null : name)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <DatePicker label={t("common.from")} value={from} onChange={setFrom} slotProps={{ textField: { size: "small", sx: { width: 160 } } }} />
                <DatePicker
                  label={t("common.to")}
                  value={to}
                  onChange={setTo}
                  minDate={from ?? undefined}
                  slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
                />
                {filtering && (
                  <Button
                    onClick={() => {
                      setCategory(null);
                      setFrom(null);
                      setTo(null);
                    }}
                  >
                    {t("common.clear")}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Card>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Grid container spacing={2.5}>
            {[0, 1, 2].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={280} />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 && !error ? (
          <Card>
            <EmptyState
              title={filtering ? t("place.noMatchTitle") : t("place.emptyTitle")}
              description={filtering ? t("place.noMatchText") : t("place.emptyText")}
              action={
                !filtering &&
                place && (
                  <Button variant="contained" color="secondary" onClick={() => setReporting(true)}>
                    {t("place.reportFirst")}
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map((incident, i) => (
              <Grid key={incident.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <IncidentCard incident={incident} index={i} onClick={setSelected} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <IncidentDetailsDialog incident={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
      <ReportIncidentDialog open={reporting} place={place} categories={categories} onClose={() => setReporting(false)} />
    </Box>
  );
}
