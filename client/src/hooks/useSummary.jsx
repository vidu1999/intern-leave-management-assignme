import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchSummary } from '../services/reportService.js';

const SummaryContext = createContext(null);

/**
 * Shares dashboard/report aggregates (employee count, pending count, ...)
 * across the sidebar badges, dashboard and reports page. Refreshed on every
 * route change and manually after mutations so counters never go stale.
 */
export function SummaryProvider({ children }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const requestRef = useRef(0);

  const refreshSummary = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const data = await fetchSummary();
      if (requestId !== requestRef.current) return;
      setSummary(data);
      setError(null);
    } catch (apiError) {
      if (requestId !== requestRef.current) return;
      setError(apiError);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary, location.pathname]);

  const value = useMemo(
    () => ({ summary, loading, error, refreshSummary }),
    [summary, loading, error, refreshSummary],
  );

  return <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>;
}

export function useSummary() {
  const context = useContext(SummaryContext);
  if (!context) {
    throw new Error('useSummary must be used inside a SummaryProvider.');
  }
  return context;
}
