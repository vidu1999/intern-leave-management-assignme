import { CheckCircle2, Clock, FileText, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import RecentLeaveRequests from '../components/dashboard/RecentLeaveRequests.jsx';
import LeaveTypeChart from '../components/dashboard/LeaveTypeChart.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { useSummary } from '../hooks/useSummary.jsx';

/** Dashboard overview - every figure comes from GET /api/reports/summary. */
export default function DashboardPage() {
  const { summary, loading, error, refreshSummary } = useSummary();

  const totals = summary?.totals;
  const byLeaveType = summary?.byLeaveType ?? [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your leave management system."
      />

      {error && (
        <ErrorMessage
          className="mb-5"
          title="Could not load dashboard data"
          message={error.message}
          onRetry={refreshSummary}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={loading ? '…' : (totals?.employees ?? 0)}
          icon={Users}
          accent="blue"
          helper="People currently on record"
          loading={loading}
        />
        <StatCard
          label="Total Leave Requests"
          value={loading ? '…' : (totals?.leaveRequests ?? 0)}
          icon={FileText}
          accent="purple"
          helper="All requests ever submitted"
          loading={loading}
        />
        <StatCard
          label="Pending Requests"
          value={loading ? '…' : (totals?.pending ?? 0)}
          icon={Clock}
          accent="orange"
          helper="Awaiting a decision"
          loading={loading}
        />
        <StatCard
          label="Approved Requests"
          value={loading ? '…' : (totals?.approved ?? 0)}
          icon={CheckCircle2}
          accent="green"
          helper="Approved to date"
          loading={loading}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentLeaveRequests
            requests={summary?.recentRequests ?? []}
            loading={loading}
            error={error}
            onRetry={refreshSummary}
          />
        </div>
        <div className="min-w-0">
          <LeaveTypeChart data={byLeaveType} loading={loading} />
        </div>
      </div>
    </>
  );
}
