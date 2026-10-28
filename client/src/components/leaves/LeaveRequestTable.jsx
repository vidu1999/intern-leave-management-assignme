import { CalendarX2, Check, Eye, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import LeaveStatusBadge from './LeaveStatusBadge.jsx';
import { avatarClasses, formatDate, initials, leaveRequestCode } from '../../utils/format.js';

function SkeletonRows({ rows = 5 }) {
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-3.5">
              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${55 + ((cellIndex * 13) % 40)}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * Shared leave request table used by "Leave Requests" and "Manage Leaves".
 * Pending rows expose Approve/Reject; processed rows show the decision instead
 * so the same rules are visible everywhere.
 */
export default function LeaveRequestTable({
  requests = [],
  loading = false,
  error = null,
  onRetry,
  onApprove,
  onReject,
  onView,
  emptyTitle = 'No leave requests found',
  emptyDescription = 'Leave requests submitted by employees will appear here.',
  emptyAction,
  skeletonRows = 5,
}) {
  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error.message} onRetry={onRetry} />
      </div>
    );
  }

  if (!loading && requests.length === 0) {
    return <EmptyState icon={CalendarX2} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <>
      <MobileLeaveCards
        requests={requests}
        loading={loading}
        onApprove={onApprove}
        onReject={onReject}
        onView={onView}
      />
      <p className="hidden px-4 pt-3 text-[11px] text-muted md:block xl:hidden">
        Scroll the table horizontally to reach the remaining columns.
      </p>
      <div className="hidden overflow-x-auto scroll-area md:block">
        <table className="data-table min-w-[846px]">
          <thead>
            <tr>
              <th scope="col" className="w-[80px]">Request ID</th>
              <th scope="col" className="w-[150px]">Employee</th>
              <th scope="col" className="w-[86px]">Leave Type</th>
              <th scope="col" className="w-[92px]">Start Date</th>
              <th scope="col" className="w-[92px]">End Date</th>
              <th scope="col" className="w-[150px]">Reason</th>
              <th scope="col" className="w-[104px]">Status</th>
              <th scope="col" className="w-[150px] text-right">Actions</th>
            </tr>
          </thead>

          {loading ? (
            <SkeletonRows rows={skeletonRows} />
          ) : (
            <tbody>
              {requests.map((request) => {
                const isPending = request.status === 'Pending';
                return (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap font-medium text-muted">{leaveRequestCode(request.id)}</td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarClasses(
                            request.employee.name,
                          )}`}
                          aria-hidden="true"
                        >
                          {initials(request.employee.name)}
                        </span>
                        <div className="min-w-0 max-w-[112px]">
                          <p className="truncate font-medium text-ink">{request.employee.name}</p>
                          <p className="truncate text-xs text-muted">{request.employee.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{request.leaveType}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(request.startDate)}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(request.endDate)}</td>
                    <td className="w-[124px] max-w-[124px]">
                      <p className="truncate text-[13px] text-muted" title={request.reason}>
                        {request.reason}
                      </p>
                      {request.status === 'Rejected' && request.rejectionReason && (
                        <p
                          className="mt-0.5 truncate text-[11px] text-danger/90"
                          title={`Rejection reason: ${request.rejectionReason}`}
                        >
                          Rejected: {request.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td>
                      <LeaveStatusBadge status={request.status} size="sm" />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(request)}
                            aria-label={`View leave request ${request.id}`}
                            title="View details"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-ink"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                        {isPending ? (
                          <>
                            <Button
                              size="sm"
                              variant="success-soft"
                              className="px-2.5"
                              onClick={() => onApprove?.(request)}
                              aria-label={`Approve leave request ${request.id} for ${request.employee.name}`}
                              title="Approve request"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger-soft"
                              className="px-2.5"
                              onClick={() => onReject?.(request)}
                              aria-label={`Reject leave request ${request.id} for ${request.employee.name}`}
                              title="Reject request"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="w-[92px] pr-1 text-right text-xs text-slate-300" aria-hidden="true">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
}

/**
 * Mobile presentation of the same data. Screens narrower than 768px get cards
 * instead of a 960px-wide table so no action is ever clipped off-screen.
 */
function MobileLeaveCards({ requests, loading, onApprove, onReject, onView }) {
  if (loading) {
    return (
      <div className="space-y-3 p-4 md:hidden" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line md:hidden">
      {requests.map((request) => (
        <li key={request.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarClasses(
                  request.employee.name,
                )}`}
                aria-hidden="true"
              >
                {initials(request.employee.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{request.employee.name}</p>
                <p className="truncate text-xs text-muted">
                  {request.employee.department} · {leaveRequestCode(request.id)}
                </p>
              </div>
            </div>
            <LeaveStatusBadge status={request.status} size="sm" />
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted">Leave type</dt>
              <dd className="mt-0.5 font-medium text-ink">{request.leaveType}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted">Dates</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {formatDate(request.startDate)} – {formatDate(request.endDate)}
              </dd>
            </div>
          </dl>

          <p className="mt-2 line-clamp-2 text-[13px] text-muted">{request.reason}</p>
          {request.status === 'Rejected' && request.rejectionReason && (
            <p className="mt-1 line-clamp-2 text-[12px] text-danger/90">Rejected: {request.rejectionReason}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onView && (
              <Button size="sm" variant="secondary" icon={Eye} onClick={() => onView(request)}>
                View
              </Button>
            )}
            {request.status === 'Pending' && (
              <>
                <Button size="sm" variant="success-soft" icon={Check} onClick={() => onApprove?.(request)}>
                  Approve
                </Button>
                <Button size="sm" variant="danger-soft" icon={X} onClick={() => onReject?.(request)}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
