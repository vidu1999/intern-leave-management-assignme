import { classNames } from '../../utils/format.js';

/** Page title + subtitle with an optional action cluster on the right. */
export default function PageHeader({ title, subtitle, actions, className, children }) {
  return (
    <div className={classNames('mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
