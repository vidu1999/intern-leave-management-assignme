const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

/**
 * Formats an ISO calendar date (`2026-11-02`) as `02 Nov 2026`.
 * Deliberately avoids `new Date(string)` timezone shifts by parsing parts.
 */
export function formatDate(value) {
  if (typeof value !== 'string') return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const monthLabel = MONTHS[Number(month) - 1];
  if (!monthLabel) return value;
  return `${day} ${monthLabel} ${year}`;
}

/** Formats an ISO timestamp for the request detail view. */
export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${time}`;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '—';
  if (startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Human friendly employee reference, e.g. id 7 → EMP-007. */
export function employeeCode(id) {
  return `EMP-${String(id).padStart(3, '0')}`;
}

/** Human friendly leave request reference, e.g. id 12 → LR-012. */
export function leaveRequestCode(id) {
  return `LR-${String(id).padStart(3, '0')}`;
}

export function pluralise(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const AVATAR_PALETTE = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
];

/** Deterministic avatar colour so the same employee always looks the same. */
export function avatarClasses(seed = '') {
  const total = String(seed)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_PALETTE[total % AVATAR_PALETTE.length];
}
