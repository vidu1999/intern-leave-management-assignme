import { classNames } from '../../utils/format.js';

const ACCENTS = {
  blue: { icon: 'bg-brand-50 text-brand ring-brand-100', bar: 'bg-brand' },
  green: { icon: 'bg-emerald-50 text-success ring-emerald-100', bar: 'bg-success' },
  orange: { icon: 'bg-amber-50 text-warning ring-amber-100', bar: 'bg-warning' },
  purple: { icon: 'bg-violet-50 text-accent ring-violet-100', bar: 'bg-accent' },
  red: { icon: 'bg-rose-50 text-danger ring-rose-100', bar: 'bg-danger' },
};

/** Single KPI tile used on the dashboard and the reports page. */
export default function StatCard({ label, value, icon: Icon, accent = 'blue', helper, loading = false }) {
  const styles = ACCENTS[accent] || ACCENTS.blue;

  return (
    <div className="card relative overflow-hidden p-4 sm:p-5">
      <span className={classNames('absolute inset-x-0 top-0 h-0.5 opacity-80', styles.bar)} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-slate-100" aria-hidden="true" />
          ) : (
            <p className="mt-1.5 text-[22px] font-semibold leading-none tracking-tight text-ink tabular-nums sm:text-[26px]">
              {value}
            </p>
          )}
          {helper && <p className="mt-2 truncate text-xs text-muted">{helper}</p>}
        </div>
        {Icon && (
          <span
            className={classNames(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
              styles.icon,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}
