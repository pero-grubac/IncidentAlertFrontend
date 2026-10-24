import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getIncidentsInRange } from "../api/incidents";
import { errorMessage } from "../api/client";
import { RANGES, rangeFor } from "../lib/dates";
import { translate } from "../i18n";

const IncidentsContext = createContext(null);

const DEFAULT_RANGE = RANGES.find((r) => r.key === "month");

/** The incidents shown on the map, for the date range picked in the side panel. */
export function IncidentsProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [range, setRange] = useState({ key: DEFAULT_RANGE.key, ...rangeFor(DEFAULT_RANGE.days) });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getIncidentsInRange(range.start, range.end)
      .then((data) => !cancelled && setIncidents(data))
      .catch((e) => !cancelled && setError(errorMessage(e, translate("errors.incidents"))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const selectRange = useCallback((key, start, end) => {
    setRange({ key, start: start.startOf("day"), end: end.endOf("day") });
  }, []);

  const value = useMemo(
    () => ({ incidents, range, loading, error, selectRange }),
    [incidents, range, loading, error, selectRange],
  );

  return <IncidentsContext.Provider value={value}>{children}</IncidentsContext.Provider>;
}

export function useIncidents() {
  const context = useContext(IncidentsContext);
  if (!context) throw new Error("useIncidents must be used inside <IncidentsProvider>");
  return context;
}
