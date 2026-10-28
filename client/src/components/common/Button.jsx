import { Loader2 } from 'lucide-react';
import { classNames } from '../../utils/format.js';

const VARIANTS = {
  primary:
    'bg-brand text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand/40 disabled:bg-brand/60',
  secondary:
    'border border-line bg-white text-ink shadow-sm hover:bg-slate-50 focus-visible:ring-slate-300 disabled:text-slate-400',
  ghost: 'text-muted hover:bg-slate-100 hover:text-ink focus-visible:ring-slate-300',
  success: 'bg-success text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-300',
  danger: 'bg-danger text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-300',
  'danger-soft':
    'border border-rose-200 bg-rose-50 text-danger hover:bg-rose-100 focus-visible:ring-rose-200',
  'success-soft':
    'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-200',
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
};

/** Reusable button with variants, sizes and a built-in loading state. */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={classNames(
        'inline-flex select-none items-center justify-center rounded-lg font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-80',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
      {IconRight && !isLoading && <IconRight className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

/** Shared classes so `<Link>` elements can look like buttons. */
export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return classNames(
    'inline-flex select-none items-center justify-center rounded-lg font-medium transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  );
}
