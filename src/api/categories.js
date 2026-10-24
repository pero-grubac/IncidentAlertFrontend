import { api } from "./client";

export async function getCategories() {
  const { data } = await api.get("/Category");
  return data;
}
