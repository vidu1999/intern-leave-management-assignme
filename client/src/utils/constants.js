export const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Other'];

export const LEAVE_TYPES = ['Annual', 'Casual', 'Medical'];

export const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'];

export const LEAVE_TYPE_DESCRIPTIONS = {
  Annual: 'Paid leave for vacation and planned time off.',
  Casual: 'Short-term leave for personal matters.',
  Medical: 'Leave taken for health and recovery reasons.',
};

export const DEPARTMENT_STYLES = {
  IT: 'bg-sky-50 text-sky-700 ring-sky-200',
  HR: 'bg-violet-50 text-violet-700 ring-violet-200',
  Finance: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Marketing: 'bg-amber-50 text-amber-700 ring-amber-200',
  Operations: 'bg-slate-100 text-slate-700 ring-slate-200',
  Other: 'bg-rose-50 text-rose-700 ring-rose-200',
};

/** Colour tokens reused by charts, badges and stat cards. */
export const LEAVE_TYPE_COLORS = {
  Annual: '#2563EB',
  Casual: '#A855F7',
  Medical: '#16A34A',
};

export const STATUS_COLORS = {
  Pending: '#F59E0B',
  Approved: '#16A34A',
  Rejected: '#EF4444',
};
