import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, CheckCircle2, Inbox } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import LeaveFilters from '../components/leaves/LeaveFilters.jsx';
import LeaveRequestTable from '../components/leaves/LeaveRequestTable.jsx';
import LeaveRequestDetail from '../components/leaves/LeaveRequestDetail.jsx';
import RejectLeaveModal from '../components/leaves/RejectLeaveModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Button, { buttonClasses } from '../components/common/Button.jsx';
import { approveLeaveRequest, rejectLeaveRequest } from '../services/leaveService.js';
import { useLeaveRequests } from '../hooks/useLeaveRequests.js';
import { useToast } from '../hooks/useToast.jsx';
import { useSummary } from '../hooks/useSummary.jsx';
import { formatDateRange, pluralise } from '../utils/format.js';

/** Live leave request queue with search, filters, pagination and decisions. */
export default function LeaveRequestsPage() {
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
  } = useLeaveRequests({ pageSize: 8 });

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState(null);
  const toast = useToast();
  const { refreshSummary } = useSummary();

  const handleApprove = async () => {
    if (!approveTarget) return;
    setIsApproving(true);
    try {
      const response = await approveLeaveRequest(approveTarget.id);
      toast.success(
        `${response.data.employee.name}'s request (${formatDateRange(
          response.data.startDate,
          response.data.endDate,
        )}) was approved.`,
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
      const response = await rejectLeaveRequest(rejectTarget.id, rejectionReason);
      toast.success(
        `${response.data.employee.name}'s request was rejected and the reason was saved.`,
        { title: 'Request rejected' },
      );
      setRejectTarget(null);
      setDetailTarget(null);
      await refresh();
      refreshSummary();
    } catch (apiError) {
      // 409 means someone else already decided this request: the modal is stale,
      // so close it and refresh instead of leaving a misleading error on screen.
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
        title="Leave Requests"
        subtitle="View and manage all leave requests."
        actions={
          <Link to="/leaves/new" className={buttonClasses({ size: 'md' })}>
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            New Request
          </Link>
        }
      />

      <Card className="mb-5" noPadding>
        <LeaveFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </Card>

      <Card
        noPadding
        title="All Requests"
        subtitle={loading ? 'Loading requests…' : pluralise(pagination.total, 'request')}
        action={
          hasActiveFilters ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100">
              Filtered
            </span>
          ) : null
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
              ? 'Try a different search term or clear the filters to see all requests.'
              : 'Once employees submit leave requests they will be listed here.'
          }
          emptyAction={
            hasActiveFilters ? (
              <Button variant="secondary" icon={Inbox} onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <Link to="/leaves/new" className={buttonClasses({ size: 'sm' })}>
                Submit a request
              </Link>
            )
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

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Approve leave request?"
        description="The employee's request will be marked Approved and this cannot be undone through the normal workflow."
        confirmLabel="Approve Request"
        variant="primary"
        isLoading={isApproving}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      >
        {approveTarget && (
          <div className="space-y-1.5 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3.5 py-3 text-[13px]">
            <p className="flex items-center gap-2 font-medium text-emerald-900">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {approveTarget.employee.name} · {approveTarget.leaveType}
            </p>
            <p className="text-emerald-800">{formatDateRange(approveTarget.startDate, approveTarget.endDate)}</p>
            <p className="text-emerald-700/90">{approveTarget.reason}</p>
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

      <LeaveRequestDetail
        open={Boolean(detailTarget)}
        request={detailTarget}
        onClose={() => setDetailTarget(null)}
        onApprove={(request) => {
          setDetailTarget(null);
          setApproveTarget(request);
        }}
        onReject={(request) => {
          setDetailTarget(null);
          setRejectTarget(request);
        }}
      />
    </>
  );
}
