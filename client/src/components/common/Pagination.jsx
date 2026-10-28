import { ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '../../utils/format.js';

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const result = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('…');
    result.push(page);
  });
  return result;
}

/** Server-side pagination footer with result range and page buttons. */
export default function Pagination({ page, pageSize, total, totalPages, onPageChange, disabled = false }) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-muted">
        Showing <span className="font-medium text-ink">{from}</span>–
        <span className="font-medium text-ink">{to}</span> of{' '}
        <span className="font-medium text-ink">{total}</span> requests
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {pageWindow(page, safeTotalPages).map((entry, index) =>
          entry === '…' ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              disabled={disabled}
              aria-current={entry === page ? 'page' : undefined}
              className={classNames(
                'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] font-medium transition',
                entry === page
                  ? 'bg-brand text-white shadow-sm'
                  : 'border border-line text-muted hover:bg-slate-50 hover:text-ink',
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= safeTotalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
