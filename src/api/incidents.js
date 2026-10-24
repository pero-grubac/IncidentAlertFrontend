import { api } from "./client";

const BASE = "/Incident";

export async function getIncidentsInRange(start, end) {
  const { data } = await api.get(`${BASE}/GetAllInDateRange`, {
    params: { startDate: start.toISOString(), endDate: end.toISOString() },
  });
  return data;
}

export async function getIncidentsByLocation(name) {
  const { data } = await api.get(`${BASE}/GetAllByLocationName/${encodeURIComponent(name)}`);
  return data;
}

/**
 * Sends a citizen report. It goes to the moderation queue and only appears on the
 * map once a moderator approves it.
 */
export async function reportIncident({ title, text, dateTime, location, categories, images }) {
  const form = new FormData();
  form.append("title", title);
  form.append("text", text);
  form.append("dateTime", dateTime.toISOString());
  form.append("location.id", String(location.id ?? 0));
  form.append("location.name", location.name);
  form.append("location.latitude", String(location.latitude));
  form.append("location.longitude", String(location.longitude));
  categories.forEach((category) => form.append("categories", category));
  images.forEach((image) => form.append("images", image));

  await api.post(BASE, form);
}
