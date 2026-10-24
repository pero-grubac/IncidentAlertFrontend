import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { incidentColor } from "../../lib/categories";
import { fromNow } from "../../lib/dates";
import { groupByLocation } from "../../lib/grouping";
import { useT } from "../../i18n";
import { clusterIcon, incidentIcon, selectionIcon } from "./markers";
import { TILE_ATTRIBUTION, TILE_URL } from "./tiles";

// Western Balkans, where the seeded demo data lives.
const DEFAULT_CENTER = [44.2, 18.6];
const DEFAULT_ZOOM = 7;

function ClickHandler({ onClick }) {
  useMapEvents({ click: (event) => onClick?.(event.latlng) });
  return null;
}

/** Frames all incidents once and flies to whatever gets focused, leaving room for the panel or the bottom sheet. */
function Camera({ focus, groups, leftInset, bottomInset }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || groups.length === 0) return;
    fitted.current = true;
    const points = groups.map((g) => [g.location.latitude, g.location.longitude]);
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(points, { paddingTopLeft: [leftInset + 60, 60], paddingBottomRight: [60, bottomInset + 60], maxZoom: 13 });
  }, [groups, map, leftInset, bottomInset]);

  useEffect(() => {
    if (!focus) return;
    const zoom = Math.max(map.getZoom(), focus.zoom ?? 14);
    // Shift the target up when the bottom sheet covers the lower part of the map.
    const target = map.project([focus.latitude, focus.longitude], zoom).add([-leftInset / 2, bottomInset / 2]);
    map.flyTo(map.unproject(target, zoom), zoom, { duration: 0.8 });
  }, [focus, map, leftInset, bottomInset]);

  return null;
}

function SelectionMarker({ place, onReport, onOpenLocation }) {
  const t = useT();
  const ref = useRef(null);

  useEffect(() => {
    // Leaflet needs a tick to attach the marker before its popup can open.
    const id = setTimeout(() => ref.current?.openPopup(), 0);
    return () => clearTimeout(id);
  }, [place]);

  return (
    <Marker ref={ref} position={[place.latitude, place.longitude]} icon={selectionIcon} zIndexOffset={1000}>
      <Popup>
        <Typography variant="overline" color="secondary" lineHeight={1.5}>
          {t("map.selected")}
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {place.loading ? t("map.finding") : place.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
        </Typography>
        <Stack spacing={1}>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<AddLocationAltRoundedIcon />}
            disabled={place.loading}
            onClick={() => onReport(place)}
          >
            {t("map.reportHere")}
          </Button>
          <Button size="small" disabled={place.loading} onClick={() => onOpenLocation(place)}>
            {t("map.seeReports")}
          </Button>
        </Stack>
      </Popup>
    </Marker>
  );
}

function LocationMarker({ group, active, onOpenLocation }) {
  const t = useT();
  const latest = group.incidents[0];
  const icon = incidentIcon(incidentColor(latest), group.incidents.length, active);

  return (
    <Marker
      position={[group.location.latitude, group.location.longitude]}
      icon={icon}
      title={group.location.name}
      // Read by the cluster icon to show the number of incidents, not places.
      incidentCount={group.incidents.length}
      color={incidentColor(latest)}
    >
      <Popup>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {group.location.name}
        </Typography>
        <Stack divider={<Divider flexItem />} spacing={0.75} sx={{ mb: 1.5 }}>
          {group.incidents.slice(0, 3).map((incident) => (
            <Box key={incident.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: incidentColor(incident), flexShrink: 0 }} />
                <Typography variant="body2" fontWeight={600} noWrap>
                  {incident.title}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                {fromNow(incident.dateTime)}
              </Typography>
            </Box>
          ))}
        </Stack>
        {group.incidents.length > 3 && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            {t("map.more", { n: group.incidents.length - 3 })}
          </Typography>
        )}
        <Button fullWidth size="small" variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => onOpenLocation(group.location)}>
          {t("map.openPlace")}
        </Button>
      </Popup>
    </Marker>
  );
}

export default function IncidentMap({
  incidents,
  selection,
  focus,
  activeLocation,
  leftInset = 0,
  bottomInset = 0,
  showZoom = true,
  onMapClick,
  onReport,
  onOpenLocation,
}) {
  const t = useT();
  const groups = useMemo(() => groupByLocation(incidents), [incidents]);

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} zoomControl={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} maxZoom={19} />
      {showZoom && <ZoomControl position="bottomright" />}
      <Camera focus={focus} groups={groups} leftInset={leftInset} bottomInset={bottomInset} />
      <ClickHandler onClick={onMapClick} />

      {/* Nearby places merge into one bubble when zoomed out; a click zooms in on them. */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={56}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        iconCreateFunction={(cluster) => clusterIcon(cluster, (places) => t("map.cluster", { n: places }))}
      >
        {groups.map((group) => (
          <LocationMarker
            key={group.location.name}
            group={group}
            active={activeLocation === group.location.name}
            onOpenLocation={onOpenLocation}
          />
        ))}
      </MarkerClusterGroup>

      {selection && <SelectionMarker place={selection} onReport={onReport} onOpenLocation={onOpenLocation} />}
    </MapContainer>
  );
}
