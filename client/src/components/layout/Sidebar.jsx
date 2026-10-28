import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck2,
  CalendarPlus,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { useSummary } from '../../hooks/useSummary.jsx';
import { classNames, initials } from '../../utils/format.js';

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, badgeKey: null },
  { to: '/employees', label: 'Employees', icon: Users, badgeKey: null },
  { to: '/leaves', label: 'Leave Requests', icon: CalendarCheck2, badgeKey: 'pending', end: true },
  { to: '/leaves/new', label: 'Submit Leave Request', icon: CalendarPlus, badgeKey: null, end: true },
];

const ADMIN_NAV = [
  { to: '/admin/leaves', label: 'Manage Leaves', icon: SlidersHorizontal, badgeKey: 'pending' },
  { to: '/reports', label: 'Reports', icon: BarChart3, badgeKey: null },
];

function NavItem({ item, pendingCount, onNavigate }) {
  const Icon = item.icon;
  const badge = item.badgeKey === 'pending' ? pendingCount : 0;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        classNames(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150',
          isActive
            ? 'bg-brand text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.9)]'
            : 'text-slate-300/90 hover:bg-white/[0.06] hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={classNames('h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')}
            aria-hidden="true"
          />
          <span className="truncate">{item.label}</span>
          {badge > 0 && (
            <span
              className={classNames(
                'ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
                isActive ? 'bg-white/20 text-white' : 'bg-amber-400/15 text-amber-300',
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const { summary } = useSummary();
  const pendingCount = summary?.totals?.pending ?? 0;

  return (
    <div className="flex h-full flex-col bg-navy-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-700 shadow-[0_10px_24px_-12px_rgba(37,99,235,0.9)]">
          <CalendarCheck2 className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight text-white">LeaveManager</p>
          <p className="truncate text-[11px] text-slate-400">Omibits (Pvt) Ltd.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 scroll-area" aria-label="Main navigation">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Main</p>
          <ul className="space-y-1">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavItem item={item} pendingCount={pendingCount} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Admin</p>
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => (
              <li key={item.to}>
                <NavItem item={item} pendingCount={pendingCount} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Local demonstration notice - no authentication is implemented. */}
      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
          <p className="text-[11px] font-semibold text-amber-300">Local demonstration</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          No sign-in is required. Admin screens are not protected by authentication.
        </p>
      </div>

      {/* User profile */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl px-1 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-semibold text-brand-200 ring-1 ring-white/10">
            {initials('HR Administrator')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">HR Administrator</p>
            <p className="truncate text-[11px] text-slate-400">People Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Fixed dark navy sidebar (desktop) and slide-over drawer (mobile). */
export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] shadow-sidebar lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[86vw] animate-slide-up shadow-popover">
            <SidebarContent onNavigate={onCloseMobile} />
          </div>
        </div>
      )}
    </>
  );
}
