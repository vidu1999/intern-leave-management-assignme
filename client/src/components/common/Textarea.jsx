import { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { classNames } from '../../utils/format.js';

/** Multiline input with optional live character counter. */
export default function Textarea({
  label,
  error,
  hint,
  maxLength,
  showCounter = false,
  value = '',
  className,
  required = false,
  id,
  rows = 4,
  ...rest
}) {
  const generatedId = useId();
  const textareaId = id || `textarea-${generatedId}`;
  const errorId = `${textareaId}-error`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="field-label">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={classNames(
          'field-control resize-y leading-relaxed',
          error && 'field-control-error',
        )}
        {...rest}
      />
      <div className="mt-1.5 flex items-start justify-between gap-3">
        <span>
          {error ? (
            <span id={errorId} className="flex items-center gap-1 text-xs font-medium text-danger">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {error}
            </span>
          ) : (
            hint && <span className="text-xs text-muted">{hint}</span>
          )}
        </span>
        {showCounter && maxLength && (
          <span
            className={classNames(
              'shrink-0 tabular-nums text-xs',
              value.length > maxLength * 0.9 ? 'text-warning' : 'text-muted',
            )}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
