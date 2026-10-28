import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLeaveRequests } from '../services/leaveService.js';
import { useDebouncedValue } from './useDebouncedValue.js';

const EMPTY_PAGINATION = { page: 1, pageSize: 8, total: 0, totalPages: 1 };

/**
 * Loads leave requests with server-side search, filters and pagination.
 * Mutations (approve/reject) are performed by the caller; `refresh()` reloads
 * the current page so the table always reflects the database.
 */
export function useLeaveRequests({ pageSize = 8, status: initialStatus = '' } = {}) {
  const [filters, setFilters] = useState({
    search: '',
    leaveType: '',
    status: initialStatus,
    page: 1,
  });
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ ...EMPTY_PAGINATION, pageSize });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestRef.current;
      if (!silent) setLoading(true);
      try {
        const data = await fetchLeaveRequests({
          page: filters.page,
          pageSize,
          search: debouncedSearch.trim() || undefined,
          leaveType: filters.leaveType || undefined,
          status: filters.status || undefined,
        });
        if (requestId !== requestRef.current) return;
        setItems(data.items);
        setPagination(data.pagination ?? { ...EMPTY_PAGINATION, pageSize });
        setError(null);
      } catch (apiError) {
        if (requestId !== requestRef.current) return;
        setError(apiError);
        setItems([]);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [filters.page, filters.leaveType, filters.status, debouncedSearch, pageSize],
  );

  useEffect(() => {
    load();
  }, [load]);

  const updateFilters = useCallback((patch) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? (patch.search !== undefined || patch.leaveType !== undefined || patch.status !== undefined ? 1 : current.page),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', leaveType: '', status: initialStatus, page: 1 });
  }, [initialStatus]);

  const refresh = useCallback(() => load({ silent: true }), [load]);

  const hasActiveFilters = Boolean(filters.search || filters.leaveType || filters.status);

  return {
    items,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    resetFilters,
    refresh,
    hasActiveFilters,
  };
}
