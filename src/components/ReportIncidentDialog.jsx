import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CategoryChip from "./CategoryChip";
import { reportIncident } from "../api/incidents";
import { errorMessage } from "../api/client";
import { translateText } from "../lib/translate";
import { translationEnabled } from "../config";
import { useNotify } from "../context/NotificationContext";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, emptyReport, validate } from "../lib/report";
import { useT } from "../i18n";

function PhotoPicker({ photos, onChange, onReject }) {
  const t = useT();
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);

  const add = (files) => {
    const accepted = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) onReject(t("report.notImage", { name: file.name }));
      else if (file.size > MAX_PHOTO_BYTES) onReject(t("report.tooLarge", { name: file.name }));
      else accepted.push({ file, url: URL.createObjectURL(file) });
    }
    const next = [...photos, ...accepted];
    if (next.length > MAX_PHOTOS) onReject(t("report.tooMany", { max: MAX_PHOTOS }));
    onChange(next.slice(0, MAX_PHOTOS));
  };

  const remove = (index) => {
    URL.revokeObjectURL(photos[index].url);
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add([...e.dataTransfer.files]);
        }}
        sx={(theme) => ({
          border: "1.5px dashed",
          borderColor: dragging ? "primary.main" : theme.palette.surface.lineStrong,
          bgcolor: dragging ? alpha(theme.palette.primary.main, 0.08) : theme.palette.surface.subtle,
          borderRadius: 3,
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          transition: "all .15s",
          "&:hover": { borderColor: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) },
        })}
      >
        <AddPhotoAlternateOutlinedIcon color="primary" />
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {t("report.addPhotos")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("report.photosHint", { max: MAX_PHOTOS })}
          </Typography>
        </Box>
        <input
          ref={input}
          hidden
          multiple
          type="file"
          accept="image/*"
          data-testid="photo-input"
          onChange={(e) => {
            add([...e.target.files]);
            e.target.value = "";
          }}
        />
      </Box>

      {photos.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          {photos.map((photo, i) => (
            <Box key={photo.url} sx={{ position: "relative" }} className="ia-pop">
              <Box component="img" src={photo.url} alt={photo.file.name} sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: 2, display: "block" }} />
              <IconButton
                size="small"
                aria-label={t("report.removePhoto", { name: photo.file.name })}
                onClick={() => remove(i)}
                sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#0F172A", color: "#fff", p: 0.25, "&:hover": { bgcolor: "#334155" } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function ReportIncidentDialog({ open, onClose, place, categories, onReported }) {
  const t = useT();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const notify = useNotify();
  const [form, setForm] = useState(emptyReport);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(emptyReport());
      setErrors({});
      setPhotoError(null);
    }
  }, [open]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const error = (field) => (errors[field] ? t(errors[field]) : undefined);

  const toggleCategory = (name) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(name) ? f.categories.filter((c) => c !== name) : [...f.categories, name],
    }));

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      // Reports are stored in Serbian; with a Google key they are translated before sending.
      const [title, text] = translationEnabled
        ? await Promise.all([translateText(form.title.trim(), "sr"), translateText(form.text.trim(), "sr")])
        : [form.title.trim(), form.text.trim()];

      await reportIncident({
        title,
        text,
        dateTime: form.dateTime,
        location: place,
        categories: form.categories,
        images: form.photos.map((p) => p.file),
      });
      notify(t("report.sent"), "success");
      onReported?.();
      onClose();
    } catch (e) {
      notify(errorMessage(e, t("report.failed")), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="sm"
      component="form"
      onSubmit={submit}
      noValidate
    >
      {submitting && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}
      <DialogTitle sx={{ pb: 1, pr: 7 }}>
        {t("report.title")}
        <Typography variant="body2" color="text.secondary">
          {t("report.subtitle")}
        </Typography>
      </DialogTitle>
      <IconButton onClick={onClose} aria-label={t("common.close")} disabled={submitting} sx={{ position: "absolute", top: 14, right: 14 }}>
        <CloseRoundedIcon />
      </IconButton>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          {place && (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={(th) => ({
                p: 1.5,
                borderRadius: 3,
                bgcolor: alpha(th.palette.secondary.main, 0.08),
                border: `1px solid ${alpha(th.palette.secondary.main, 0.18)}`,
              })}
            >
              <PlaceRoundedIcon color="secondary" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={650} noWrap>
                  {place.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Number(place.latitude).toFixed(5)}, {Number(place.longitude).toFixed(5)}
                </Typography>
              </Box>
            </Stack>
          )}

          <TextField
            label={t("report.titleLabel")}
            placeholder={t("report.titlePlaceholder")}
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            error={Boolean(errors.title)}
            helperText={error("title")}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label={t("report.textLabel")}
            placeholder={t("report.textPlaceholder")}
            value={form.text}
            onChange={(e) => set("text")(e.target.value)}
            error={Boolean(errors.text)}
            helperText={error("text")}
            required
            fullWidth
            multiline
            minRows={4}
          />

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              {t("report.category")}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap role="group" aria-label={t("report.categories")}>
              {categories.map((c) => (
                <CategoryChip key={c.id ?? c.name} name={c.name} size="medium" selected={form.categories.includes(c.name)} onClick={() => toggleCategory(c.name)} />
              ))}
            </Stack>
            {errors.categories && <FormHelperText error>{error("categories")}</FormHelperText>}
          </Box>

          <DateTimePicker
            label={t("report.when")}
            value={form.dateTime}
            onChange={set("dateTime")}
            disableFuture
            ampm={false}
            slotProps={{ textField: { fullWidth: true, error: Boolean(errors.dateTime), helperText: error("dateTime") } }}
          />

          <PhotoPicker photos={form.photos} onChange={set("photos")} onReject={setPhotoError} />
          {photoError && (
            <Alert severity="warning" onClose={() => setPhotoError(null)}>
              {photoError}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button type="submit" variant="contained" color="secondary" endIcon={<SendRoundedIcon />} disabled={submitting}>
          {submitting ? t("report.sending") : t("report.send")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
