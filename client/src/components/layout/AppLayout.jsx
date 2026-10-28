import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import ApiStatusBanner from './ApiStatusBanner.jsx';
import { useApiHealth } from '../../hooks/useApiHealth.js';

/** Application shell: sidebar, header and the scrollable content column. */
export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const { status, details, isRechecking, recheck } = useApiHealth();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleRetry = useCallback(async () => {
    const result = await recheck();
    // Backend is back: reload so every page (and its data) is fresh again.
    if (result?.online) window.location.reload();
  }, [recheck]);

  return (
    <div className="min-h-screen bg-page">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="lg:pl-[260px]">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <ApiStatusBanner
            status={status}
            details={details}
            isRechecking={isRechecking}
            onRetry={handleRetry}
          />
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-[1440px] px-4 pb-8 text-xs text-slate-400 sm:px-6 lg:px-8">
          LeaveManager · Local demonstration build for the Omibits Software Engineering Intern assignment.
        </footer>
      </div>
    </div>
  );
}
