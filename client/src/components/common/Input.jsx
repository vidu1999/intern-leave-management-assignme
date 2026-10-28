import { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { classNames } from '../../utils/format.js';

/** Text-like input with a label, hint and inline validation message. */
export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  className,
  required = false,
  id,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={classNames(error && errorId, hint && hintId) || undefined}
          className={classNames('field-control', Icon && 'pl-9', error && 'field-control-error')}
          {...rest}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
