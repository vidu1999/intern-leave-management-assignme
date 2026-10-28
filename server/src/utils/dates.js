'use strict';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses a strict `YYYY-MM-DD` calendar date.
 * Returns `null` for malformed values (e.g. `2026-02-30`, `2026-13-01`,
 * `02/11/2026`) so callers can raise a field specific validation error.
 */
function parseIsoDate(value) {
  if (typeof value !== 'string') return null;
  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isRealDate ? date : null;
}

function isValidIsoDate(value) {
  return parseIsoDate(value) !== null;
}

/** Inclusive number of calendar days covered by a leave request. */
function countDays(startDate, endDate) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

module.exports = { parseIsoDate, isValidIsoDate, countDays };
