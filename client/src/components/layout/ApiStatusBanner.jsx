import { AlertTriangle, PlugZap, ServerCrash } from 'lucide-react';
import Button from '../common/Button.jsx';
import { API_BASE_URL } from '../../services/api.js';

/**
 * Global banner shown only when the API cannot be reached.
 *
 * A stopped backend used to surface as a per-action toast that looked like a
 * form validation problem. This makes the real cause visible on every page and
 * gives the exact command that fixes it.
 */
export default function ApiStatusBanner({ status, details, isRechecking, onRetry }) {
  if (status !== 'offline') return null;

  const isServerError = details?.kind === 'server' || details?.kind === 'endpoint';

  return (
    <div
      role="alert"
      className="mb-5 overflow-hidden rounded-xl border border-amber-300 bg-amber-50 shadow-card"
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-amber-200">
          {isServerError ? (
            <ServerCrash className="h-[18px] w-[18px] text-warning" aria-hidden="true" />
          ) : (
            <PlugZap className="h-[18px] w-[18px] text-warning" aria-hidden="true" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">
            {isServerError ? 'The API answered with an error' : 'The API is not reachable'}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-800">
            {isServerError
              ? details?.message
              : 'Data cannot be loaded or saved until the backend is running. Nothing you typed has been lost — retry once it is up.'}
          </p>

          {!isServerError && (
            <div className="mt-2.5 rounded-lg border border-amber-200 bg-white/70 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                Start the whole app
              </p>
              <code className="mt-1 block break-all font-mono text-[12px] text-ink">
                npm run dev
              </code>
              <p className="mt-1 text-[11px] text-amber-700">
                Run it in the project root — it starts the API on port 5000 and this app on port
                5173. Expected at <span className="font-mono">{API_BASE_URL}</span>; the API answers
                <span className="font-mono"> /api/health</span>.
              </p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onRetry} isLoading={isRechecking}>
              Retry connection
            </Button>
            <span className="flex items-center gap-1.5 text-[11px] text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Re-checked automatically every 30 seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
