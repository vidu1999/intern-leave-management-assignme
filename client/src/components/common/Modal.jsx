import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { classNames } from '../../utils/format.js';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';

const WIDTHS = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

/**
 * Accessible modal dialog:
 *  - rendered in a portal above the application
 *  - Escape closes it, backdrop click closes it
 *  - focus moves into the dialog and Tab is trapped inside
 *  - background scrolling is locked while open
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  icon: Icon,
  iconClassName = 'bg-brand-50 text-brand ring-brand-100',
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEscapeKey(() => onClose?.(), open);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector(
        'input:not([type="hidden"]), select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
      );
      (focusable || panel).focus({ preventScroll: true });
    };
    // Defer focus slightly so the dialog is painted, but never steal focus if
    // the user has already interacted with a field inside the dialog.
    const focusIfUntouched = () => {
      const active = document.activeElement;
      if (!active || active === document.body || !panelRef.current?.contains(active)) {
        focusFirst();
      }
    };
    const timer = setTimeout(focusIfUntouched, 40);
    const settleTimer = setTimeout(focusIfUntouched, 400);

    const onKeyDown = (event) => {
      if (event.key !== 'Tab' || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      clearTimeout(settleTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={classNames(
          'relative z-10 max-h-[92vh] w-full animate-slide-up overflow-y-auto rounded-t-2xl bg-white shadow-popover sm:rounded-2xl',
          WIDTHS[size] || WIDTHS.md,
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
          {Icon && (
            <span
              className={classNames(
                'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1',
                iconClassName,
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-[13px] leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
