import { useCallback, useEffect, useRef, useState } from 'react';
import { checkApiHealth } from '../services/api.js';

const POLL_INTERVAL = 30000;

/**
 * Tracks whether the REST API is reachable.
 *
 * Pings GET /api/health on mount, when the tab regains focus and every 30s.
 * This turns "Cannot reach the API" from a mystery that appears only after an
 * action into an obvious global state with a fix.
 */
export function useApiHealth({ intervalMs = POLL_INTERVAL } = {}) {
  const [status, setStatus] = useState('checking'); // checking | online | offline
  const [details, setDetails] = useState(null);
  const [isRechecking, setRechecking] = useState(false);
  const mounted = useRef(true);

  const check = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setRechecking(true);
    const result = await checkApiHealth();
    if (!mounted.current) return result;

    setStatus(result.online ? 'online' : 'offline');
    setDetails(result.online ? result.data : result.error);
    setRechecking(false);
    return result;
  }, []);

  useEffect(() => {
    mounted.current = true;
    check({ silent: true });

    const onFocus = () => {
      if (document.visibilityState === 'visible') check({ silent: true });
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    const timer = setInterval(() => check({ silent: true }), intervalMs);

    return () => {
      mounted.current = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      clearInterval(timer);
    };
  }, [check, intervalMs]);

  return { status, details, isRechecking, recheck: check };
}
