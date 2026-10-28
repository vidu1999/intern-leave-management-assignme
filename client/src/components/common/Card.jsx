import { classNames } from '../../utils/format.js';

/** White rounded panel with an optional header row. */
export default function Card({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  noPadding = false,
}) {
  return (
    <section className={classNames('card flex flex-col', className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={classNames(!noPadding && 'p-5', 'flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}
