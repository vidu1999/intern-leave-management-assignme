import { Link } from 'react-router-dom';
import { Compass, Home, Users } from 'lucide-react';
import { buttonClasses } from '../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-100">
          <Compass className="h-7 w-7 text-brand" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-muted">Error 404</p>
        <h1 className="mt-1 text-xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The page you are looking for does not exist or may have been moved. Use the navigation to continue.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/" className={buttonClasses({ size: 'md' })}>
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
          <Link to="/employees" className={buttonClasses({ variant: 'secondary', size: 'md' })}>
            <Users className="h-4 w-4" aria-hidden="true" />
            Employees
          </Link>
        </div>
      </div>
    </div>
  );
}
