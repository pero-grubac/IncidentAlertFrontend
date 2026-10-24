import { useEffect, useState } from "react";
import { getCategories } from "../api/categories";

let cached = null;

/** Incident categories, fetched once per page load. */
export function useCategories() {
  const [categories, setCategories] = useState(cached ?? []);

  useEffect(() => {
    if (cached) return undefined;
    let cancelled = false;
    getCategories()
      .then((data) => {
        cached = data;
        if (!cancelled) setCategories(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}

export function resetCategoriesCache() {
  cached = null;
}
