import { useState } from 'react';
import { CheckCircle2, Info, Search, ShieldCheck, X } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import Button from '../components/common/Button.jsx';
import Pagination from '../components/common/Pagination.jsx';
import LeaveRequestTable from '../components/leaves/LeaveRequestTable.jsx';
import LeaveRequestDetail from '../components/leaves/LeaveRequestDetail.jsx';
import RejectLeaveModal from '../components/leaves/RejectLeaveModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { approveLeaveRequest, rejectLeaveRequest } from '../services/leaveService.js';
import { useLeaveRequests } from '../hooks/useLeaveRequests.js';
import { useSummary } from '../hooks/useSummary.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { LEAVE_TYPES } from '../utils/constants.js';
import { classNames, formatDateRange, pluralise } from '../utils/format.js';

const TABS = [
  { key: '', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Rejected', label: 'Rejected' },
];

/**
 * Administrator view: every request with status tabs, a detail view and the
 * same approval workflow. Authentication is intentionally out of scope for
 * this assignment - the notice in the UI and README says so explicitly.
 */
export default function ManageLeavesPage() {
  const {
    items,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    resetFilters,
    refresh,
    hasActiveFilters,
  } = useLeaveRequests({ pageSize: 10 });

  const { summary, refreshSummary } = useSummary();
  const [detailTarget, setDetailTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState(null);
  const toast = useToast();

  const counts = {
    '': summary?.totals?.leaveRequests ?? 0,
    Pending: summary?.totals?.pending ?? 0,
    Approved: summary?.totals?.approved ?? 0,
    Rejected: summary?.totals?.rejected ?? 0,
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setIsApproving(true);
    try {
      const response = await approveLeaveRequest(approveTarget.id);
      toast.success(
        `${response.data.employee.name}'s request (${formatDateRange(response.data.startDate, response.data.endDate)}) was approved.`,
        { title: 'Request approved' },
      );
      setApproveTarget(null);
      setDetailTarget(null);
      await refresh();
      refreshSummary();
    } catch (apiError) {
      toast.error(apiError.message, { title: 'Could not approve request' });
      setApproveTarget(null);
      refresh();
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    setRejectError(null);
    try {
      await rejectLeaveRequest(rejectTarget.id, rejectionReason);
      toast.success('The request was rejected and the reason was saved.', { title: 'Request rejected' });
      setRejectTarget(null);
      setDetailTarget(null);
      await refresh();
      refreshSummary();
    } catch (apiError) {
      if (apiError.status === 409) {
        toast.info(apiError.message, { title: 'Request already processed' });
        setRejectTarget(null);
        await refresh();
        refreshSummary();
      } else {
        // The modal shows this error inline and keeps what the user typed, so a
        // toast on top of it would only repeat the same sentence.
        setRejectError(apiError.shortMessage || apiError.message);
      }
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Manage Leaves"
        subtitle="Administrator view of every leave request. Review details and record decisions."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Local demonstration · no authentication
          </span>
        }
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          This administrator screen is a <span className="font-semibold">local demonstration interface</span>. The API
          is not protected by authentication or role-based authorization, so treat it as an internal tool running on
          your machine rather than a production admin console.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-line bg-white p-1.5 shadow-card">
        {TABS.map((tab) => {
          const isActive = filters.status === tab.key;
          return (
            <button
              key={tab.key || 'all'}
              type="button"
              onClick={() => updateFilters({ status: tab.key })}
              aria-pressed={isActive}
              className={classNames(
                'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition',
                isActive ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-slate-50 hover:text-ink',
              )}
            >
              {tab.label}
              <span
                className={classNames(
                  'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted',
                )}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <Card
        noPadding
        title="Request Queue"
        subtitle={loading ? 'Loading requests…' : pluralise(pagination.total, 'request')}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Input
              placeholder="Search name or reason…"
              icon={Search}
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.target.value })}
              aria-label="Search requests"
              className="w-full sm:w-56"
            />
            <Select
              placeholder="All leave types"
              options={LEAVE_TYPES}
              value={filters.leaveType}
              onChange={(event) => updateFilters({ leaveType: event.target.value })}
              aria-label="Filter by leave type"
              className="w-full sm:w-40"
            />
            <Button variant="secondary" icon={X} onClick={resetFilters} disabled={!hasActiveFilters}>
              Clear
            </Button>
          </div>
        }
      >
        <LeaveRequestTable
          requests={items}
          loading={loading}
          error={error}
          onRetry={refresh}
          onApprove={setApproveTarget}
          onReject={(request) => {
            setRejectError(null);
            setRejectTarget(request);
          }}
          onView={setDetailTarget}
          emptyTitle={hasActiveFilters ? 'No requests match these filters' : 'No leave requests yet'}
          emptyDescription={
            hasActiveFilters
              ? 'Try another search term, leave type or status tab.'
              : 'Requests will appear here as soon as employees submit them.'
          }
          skeletonRows={6}
        />

        {!loading && !error && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(page) => updateFilters({ page })}
          />
        )}
      </Card>

      <LeaveRequestDetail
        open={Boolean(detailTarget)}
        request={detailTarget}
        onClose={() => setDetailTarget(null)}
        onApprove={(request) => setApproveTarget(request)}
        onReject={(request) => {
          setRejectError(null);
          setRejectTarget(request);
        }}
      />

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Approve this leave request?"
        description="The status changes to Approved and the decision is written to the database."
        confirmLabel="Approve Request"
        isLoading={isApproving}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      >
        {approveTarget && (
          <div className="space-y-1 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3.5 py-3 text-[13px]">
            <p className="flex items-center gap-2 font-medium text-emerald-900">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {approveTarget.employee.name} · {approveTarget.leaveType}
            </p>
            <p className="text-emerald-800">{formatDateRange(approveTarget.startDate, approveTarget.endDate)}</p>
          </div>
        )}
      </ConfirmDialog>

      <RejectLeaveModal
        open={Boolean(rejectTarget)}
        request={rejectTarget}
        isLoading={isRejecting}
        error={rejectError}
        onClose={() => {
          setRejectTarget(null);
          setRejectError(null);
        }}
        onSubmit={handleReject}
      />
    </>
  );
}
