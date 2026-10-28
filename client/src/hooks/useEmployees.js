import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchEmployees } from '../services/employeeService.js';
import { useDebouncedValue } from './useDebouncedValue.js';

/** Loads the employee list with debounced server-side search. */
export function useEmployees(initialSearch = '') {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const data = await fetchEmployees({ search: debouncedSearch.trim() });
      if (requestId !== requestRef.current) return;
      setEmployees(data);
      setError(null);
    } catch (apiError) {
      if (requestId !== requestRef.current) return;
      setError(apiError);
      setEmployees([]);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { employees, loading, error, search, setSearch, refresh };
}
