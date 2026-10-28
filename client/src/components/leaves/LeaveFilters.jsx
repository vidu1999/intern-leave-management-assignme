import { Search, SlidersHorizontal, X } from 'lucide-react';
import Select from '../common/Select.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { LEAVE_STATUSES, LEAVE_TYPES } from '../../utils/constants.js';

/** Search + leave type + status filter bar with a reset action. */
export default function LeaveFilters({ filters, onChange, onReset, hasActiveFilters, className }) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-end gap-3 p-4">
        <Input
          label="Search"
          placeholder="Search by employee name or reason…"
          icon={Search}
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          className="w-full sm:w-64 lg:w-72"
          aria-label="Search leave requests"
        />
        <Select
          label="Leave type"
          placeholder="All leave types"
          options={LEAVE_TYPES}
          value={filters.leaveType}
          onChange={(event) => onChange({ leaveType: event.target.value })}
          className="w-full sm:w-40"
        />
        <Select
          label="Status"
          placeholder="All statuses"
          options={LEAVE_STATUSES}
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className="w-full sm:w-40"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            icon={X}
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="w-full sm:w-auto"
          >
            Clear filters
          </Button>
        </div>
      </div>
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 border-t border-line px-4 py-2 text-[11px] text-muted">
          <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
          Filters applied — results are read from the database.
        </div>
      )}
    </div>
  );
}
