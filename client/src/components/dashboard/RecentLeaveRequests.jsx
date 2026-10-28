import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import LeaveStatusBadge from '../leaves/LeaveStatusBadge.jsx';
import { buttonClasses } from '../common/Button.jsx';
import { avatarClasses, formatDate, initials, leaveRequestCode } from '../../utils/format.js';

function SkeletonRows() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/** Latest leave requests table (left panel of the dashboard). */
export default function RecentLeaveRequests({ requests = [], loading, error, onRetry }) {
  return (
    <Card
      title="Recent Leave Requests"
      subtitle="The latest submissions from your team"
      noPadding
      action={
        <Link to="/leaves" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
          View all
        </Link>
      }
    >
      {error ? (
        <div className="p-4">
          <ErrorMessage message={error.message} onRetry={onRetry} />
        </div>
      ) : loading ? (
        <div className="p-5">
          <SkeletonRows />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No leave requests yet"
          description="Requests submitted by employees will appear here."
          action={
            <Link to="/leaves/new" className={buttonClasses({ size: 'sm' })}>
              Submit a request
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto scroll-area">
          <table className="data-table min-w-[600px]">
            <thead>
              <tr>
                <th scope="col">Request ID</th>
                <th scope="col">Employee</th>
                <th scope="col">Leave Type</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="whitespace-nowrap text-[12.5px] font-medium text-muted">
                    {leaveRequestCode(request.id)}
                  </td>
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
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{request.employee.name}</p>
                        <p className="truncate text-xs text-muted">{request.employee.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{request.leaveType}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(request.startDate)}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(request.endDate)}</td>
                  <td>
                    <LeaveStatusBadge status={request.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
