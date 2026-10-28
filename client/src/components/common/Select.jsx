import { useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { classNames } from '../../utils/format.js';

/** Accessible native select with consistent styling and a custom chevron. */
export default function Select({
  label,
  error,
  hint,
  options = [],
  placeholder,
  className,
  required = false,
  id,
  children,
  ...rest
}) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  const errorId = `${selectId}-error`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={classNames(
            'field-control appearance-none pr-9',
            !rest.value && 'text-slate-400',
            error && 'field-control-error',
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const labelText = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value} className="text-ink">
                {labelText}
              </option>
            );
          })}
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
