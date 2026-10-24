import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Labels come from i18n: periods.<key>
export const RANGES = [
  { key: "today", days: 0 },
  { key: "week", days: 6 },
  { key: "month", days: 29 },
  { key: "year", days: 364 },
];

/** Whole days, so "7 days" means today and the six days before it. */
export function rangeFor(days, now = dayjs()) {
  return { start: now.subtract(days, "day").startOf("day"), end: now.endOf("day") };
}

// dayjs formats in the language picked in the app (see i18n).
export function formatDateTime(value) {
  return dayjs(value).format("D MMM YYYY, HH:mm");
}

export function fromNow(value) {
  return dayjs(value).fromNow();
}

export function isWithin(value, start, end) {
  const date = dayjs(value);
  if (start && date.isBefore(dayjs(start).startOf("day"))) return false;
  if (end && date.isAfter(dayjs(end).endOf("day"))) return false;
  return true;
}
