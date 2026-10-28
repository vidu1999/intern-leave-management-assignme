import { Inbox } from 'lucide-react';
import { classNames } from '../../utils/format.js';

/** Friendly empty state with an optional call to action. */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className,
}) {
  return (
    <div className={classNames('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-100">
        <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
