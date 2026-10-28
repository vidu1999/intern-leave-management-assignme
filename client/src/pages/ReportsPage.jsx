import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, CheckCircle2, Clock, FileText, Users, XCircle } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import LeaveStatusBadge from '../components/leaves/LeaveStatusBadge.jsx';
import { buttonClasses } from '../components/common/Button.jsx';
import { useSummary } from '../hooks/useSummary.jsx';
import { LEAVE_TYPE_COLORS, STATUS_COLORS } from '../utils/constants.js';
import { avatarClasses, formatDateRange, initials, leaveRequestCode } from '../utils/format.js';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-popover">
      <p className="font-medium text-ink">{label ?? payload[0].payload.status}</p>
      <p className="mt-0.5 text-muted">{payload[0].value} request(s)</p>
    </div>
  );
}

/** Reporting dashboard built entirely from live aggregate API data. */
export default function ReportsPage() {
  const { summary, loading, error, refreshSummary } = useSummary();

  const totals = summary?.totals;
  const byStatus = summary?.byStatus ?? [];
  const byLeaveType = summary?.byLeaveType ?? [];
  const recentRequests = summary?.recentRequests ?? [];
  const totalRequests = totals?.leaveRequests ?? 0;
  const hasRequests = totalRequests > 0;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Leave statistics generated from the live database."
        actions={
          <Link to="/leaves" className={buttonClasses({ variant: 'secondary', size: 'md' })}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            Open requests
          </Link>
        }
      />

      {error && (
        <ErrorMessage
          className="mb-5"
          title="Could not load report data"
          message={error.message}
          onRetry={refreshSummary}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard
          label="Total Employees"
          value={totals?.employees ?? 0}
          icon={Users}
          accent="blue"
          loading={loading}
        />
        <StatCard
          label="Total Requests"
          value={totalRequests}
          icon={FileText}
          accent="purple"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={totals?.pending ?? 0}
          icon={Clock}
          accent="orange"
          loading={loading}
        />
        <StatCard
          label="Approved"
          value={totals?.approved ?? 0}
          icon={CheckCircle2}
          accent="green"
          loading={loading}
        />
        <StatCard
          label="Rejected"
          value={totals?.rejected ?? 0}
          icon={XCircle}
          accent="red"
          loading={loading}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Requests by Status" subtitle="Share of requests in each workflow state">
          {loading ? (
            <div className="space-y-4 py-4" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-9 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : !hasRequests ? (
            <EmptyState
              icon={BarChart3}
              title="No requests to report"
              description="Status statistics appear once leave requests are submitted."
              className="py-8"
            />
          ) : (
            <ul className="space-y-5 py-1">
              {byStatus.map((entry) => {
                const percentage = totalRequests ? Math.round((entry.count / totalRequests) * 100) : 0;
                return (
                  <li key={entry.status}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                          aria-hidden="true"
                        />
                        <span className="text-[13px] font-medium text-ink">{entry.status}</span>
                      </div>
                      <span className="text-[13px] text-muted">
                        <span className="font-semibold text-ink tabular-nums">{entry.count}</span>
                        <span className="ml-1.5 tabular-nums">{percentage}%</span>
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                      role="img"
                      aria-label={`${entry.status}: ${entry.count} of ${totalRequests} requests (${percentage}%)`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: STATUS_COLORS[entry.status] }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Requests by Leave Type" subtitle="Annual, casual and medical requests">
          {loading ? (
            <div className="h-[250px] animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          ) : !hasRequests ? (
            <EmptyState
              icon={BarChart3}
              title="No leave type data"
              description="Submit a leave request to see the distribution by leave type."
              className="py-8"
            />
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byLeaveType} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="leaveType"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    width={40}
                  />
                  <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={64}>
                    {byLeaveType.map((entry) => (
                      <Cell key={entry.leaveType} fill={LEAVE_TYPE_COLORS[entry.leaveType]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card
        className="mt-5"
        title="Recent Requests Summary"
        subtitle="The five most recently submitted requests"
        noPadding
        action={
          <Link to="/leaves" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            View all
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-3 p-5" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : recentRequests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No recent activity"
            description="Submitted leave requests will be summarised here."
          />
        ) : (
          <div className="overflow-x-auto scroll-area">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th scope="col">Request ID</th>
                  <th scope="col">Employee</th>
                  <th scope="col">Leave Type</th>
                  <th scope="col">Period</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
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
                        <span className="font-medium text-ink">{request.employee.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{request.leaveType}</td>
                    <td className="whitespace-nowrap text-muted">
                      {formatDateRange(request.startDate, request.endDate)}
                    </td>
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
    </>
  );
}
