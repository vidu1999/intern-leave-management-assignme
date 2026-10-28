import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-success',
    ring: 'ring-emerald-100',
    title: 'Success',
  },
  error: {
    icon: AlertTriangle,
    iconClass: 'text-danger',
    ring: 'ring-rose-100',
    title: 'Something went wrong',
  },
  info: {
    icon: Info,
    iconClass: 'text-brand',
    ring: 'ring-blue-100',
    title: 'Notice',
  },
};

export default function Toast({ toast, onDismiss }) {
  const variant = VARIANTS[toast.variant] || VARIANTS.info;
  const Icon = variant.icon;

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-sm animate-toast-in rounded-xl border border-line bg-white p-3.5 shadow-popover ring-1 ${variant.ring}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${variant.iconClass}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">{toast.title || variant.title}</p>
          <p className="mt-0.5 break-words text-[13px] leading-relaxed text-muted">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-m-1 shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
