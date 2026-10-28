import { AlertTriangle, RotateCw } from 'lucide-react';
import Button from './Button.jsx';
import { classNames } from '../../utils/format.js';

/** Block-level error with a retry action. Used when a data load fails. */
export default function ErrorMessage({
  title = 'Could not load data',
  message = 'Something went wrong. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}) {
  return (
    <div
      role="alert"
      className={classNames(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-100 bg-rose-50/60 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white ring-1 ring-rose-100">
        <AlertTriangle className="h-5 w-5 text-danger" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCw} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
