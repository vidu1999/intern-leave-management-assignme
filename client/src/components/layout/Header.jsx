import { Link } from 'react-router-dom';
import { CalendarPlus, Menu, CalendarCheck2 } from 'lucide-react';
import { buttonClasses } from '../common/Button.jsx';
import { initials } from '../../utils/format.js';

/** Sticky top bar: mobile navigation trigger, brand and quick actions. */
export default function Header({ onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition hover:text-ink lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <CalendarCheck2 className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-ink">LeaveManager</span>
        </div>

        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="text-[13px] text-muted">
            Employee Leave Management ·{' '}
            <span className="font-medium text-ink">Omibits (Pvt) Ltd.</span>
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/leaves/new"
            className={buttonClasses({ size: 'sm', className: 'h-9 px-3' })}
            aria-label="Submit a new leave request"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">New Leave Request</span>
            <span className="sm:hidden">New</span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700">
              {initials('HR Administrator')}
            </span>
            <span className="hidden text-[12px] font-medium text-ink sm:block">HR Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
