import { Loader2 } from 'lucide-react';
import { classNames } from '../../utils/format.js';

/** Inline or block-level loading indicator with an accessible label. */
export default function LoadingSpinner({ size = 'md', label = 'Loading…', className, inline = false }) {
  const dimensions = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames(
        'flex items-center justify-center gap-2 text-muted',
        inline ? '' : 'py-10',
        className,
      )}
    >
      <Loader2 className={classNames('animate-spin text-brand', dimensions[size])} aria-hidden="true" />
      <span className={inline ? 'sr-only' : 'text-sm'}>{label}</span>
    </div>
  );
}
