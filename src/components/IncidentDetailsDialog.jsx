import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import ReactCountryFlag from "react-country-flag";
import CategoryChip from "./CategoryChip";
import Gallery from "./Gallery";
import { categoryNames, incidentColor } from "../lib/categories";
import { formatDateTime, fromNow } from "../lib/dates";
import { translateText } from "../lib/translate";
import { translationEnabled } from "../config";
import { useT } from "../i18n";

/** Reports are stored in Serbian; "en" asks Google to translate the title and the text. */
function useTranslation(incident, language) {
  const [text, setText] = useState({ title: incident?.title, text: incident?.text, loading: false });

  useEffect(() => {
    if (!incident) return undefined;
    if (language === "sr") {
      setText({ title: incident.title, text: incident.text, loading: false });
      return undefined;
    }
    const controller = new AbortController();
    setText((t) => ({ ...t, loading: true }));
    Promise.all([translateText(incident.title, language, controller.signal), translateText(incident.text, language, controller.signal)])
      .then(([title, text]) => setText({ title, text, loading: false }))
      .catch(() => {});
    return () => controller.abort();
  }, [incident, language]);

  return text;
}

export default function IncidentDetailsDialog({ incident, open, onClose }) {
  const t = useT();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [language, setLanguage] = useState("sr");
  const translated = useTranslation(incident, language);

  useEffect(() => {
    if (open) setLanguage("sr");
  }, [open, incident]);

  if (!incident) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth fullScreen={fullScreen} maxWidth="sm" aria-labelledby="incident-title">
      <Box sx={{ height: 6, bgcolor: incidentColor(incident), flexShrink: 0 }} />
      <IconButton
        onClick={onClose}
        aria-label={t("common.close")}
        sx={{ position: "absolute", top: 14, right: 12, zIndex: 1, bgcolor: "background.paper", boxShadow: 2, "&:hover": { bgcolor: "background.paper" } }}
      >
        <CloseRoundedIcon />
      </IconButton>

      <Gallery images={incident.images} title={incident.title} />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5, pr: incident.images?.length ? 0 : 5 }}>
          {categoryNames(incident).map((name) => (
            <CategoryChip key={name} name={name} />
          ))}
        </Stack>

        <Typography id="incident-title" variant="h5" sx={{ mb: 1 }}>
          {translated.loading ? <Skeleton width="70%" /> : translated.title}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.5, sm: 2.5 }} sx={{ color: "text.secondary", mb: 2.5 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <ScheduleRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">
              {formatDateTime(incident.dateTime)} · {fromNow(incident.dateTime)}
            </Typography>
          </Stack>
          {incident.location?.name && (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
              <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" noWrap>
                {incident.location.name}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
          {translated.loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton width="60%" />
            </>
          ) : (
            translated.text
          )}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: translationEnabled ? "space-between" : "flex-end" }}>
        {translationEnabled && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TranslateRoundedIcon fontSize="small" color="action" />
            <ToggleButtonGroup size="small" exclusive value={language} onChange={(_e, v) => v && setLanguage(v)} aria-label={t("details.language")}>
              <ToggleButton value="sr" sx={{ gap: 0.75 }}>
                <ReactCountryFlag countryCode="RS" svg /> SR
              </ToggleButton>
              <ToggleButton value="en" sx={{ gap: 0.75 }}>
                <ReactCountryFlag countryCode="GB" svg /> EN
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        )}
        <Button variant="contained" onClick={onClose}>
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
