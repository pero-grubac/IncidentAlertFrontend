import axios from "axios";
import { config } from "../config";
import { translate } from "../i18n";

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: { Accept: "application/json" },
});

/** Turns an API failure into one line a person can read. */
export function errorMessage(error, fallback = translate("errors.generic")) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.Message) return data.Message;
  if (error?.code === "ERR_NETWORK") return translate("errors.network");
  return fallback;
}
