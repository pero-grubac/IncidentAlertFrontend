import dayjs from "dayjs";

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const emptyReport = () => ({ title: "", text: "", categories: [], dateTime: dayjs(), photos: [] });

/** Returns the problems of a report as i18n keys, by field. An empty object means it can be sent. */
export function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "report.errors.title";
  else if (form.title.trim().length > 120) errors.title = "report.errors.titleLong";
  if (!form.text.trim()) errors.text = "report.errors.text";
  if (form.categories.length === 0) errors.categories = "report.errors.categories";
  if (!form.dateTime?.isValid?.()) errors.dateTime = "report.errors.when";
  else if (form.dateTime.isAfter(dayjs().add(5, "minute"))) errors.dateTime = "report.errors.future";
  return errors;
}
