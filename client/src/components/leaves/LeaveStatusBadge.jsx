import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { classNames } from '../../utils/format.js';

const STATUS_STYLES = {
  Pending: {
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-warning',
    Icon: Clock,
  },
  Approved: {
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-success',
    Icon: CheckCircle2,
  },
  Rejected: {
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-danger',
    Icon: XCircle,
  },
};

/** Colour coded Pending / Approved / Rejected status pill. */
export default function LeaveStatusBadge({ status, withIcon = true, size = 'md' }) {
  const style = STATUS_STYLES[status] || {
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
    Icon: Clock,
  };
  const Icon = style.Icon;

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        style.className,
      )}
    >
      {withIcon ? (
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <span className={classNames('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      )}
      {status}
    </span>
  );
}
