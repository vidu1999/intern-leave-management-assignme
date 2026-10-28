import { Check, FileText, X } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import LeaveStatusBadge from './LeaveStatusBadge.jsx';
import { avatarClasses, formatDate, formatDateTime, formatDateRange, initials, leaveRequestCode } from '../../utils/format.js';

function DetailRow({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-[13.5px] text-ink">{children}</dd>
    </div>
  );
}

/** Read-only request detail used by the administrator view. */
export default function LeaveRequestDetail({ open, request, onClose, onApprove, onReject, busy = false }) {
  if (!request) return null;
  const isPending = request.status === 'Pending';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Leave request ${leaveRequestCode(request.id)}`}
      description="Full details as stored in the database."
      size="lg"
      icon={FileText}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Close
          </Button>
          {isPending && (
            <>
              <Button variant="danger-soft" icon={X} onClick={() => onReject?.(request)} disabled={busy}>
                Reject
              </Button>
              <Button variant="success" icon={Check} onClick={() => onApprove?.(request)} disabled={busy}>
                Approve
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-slate-50/70 p-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${avatarClasses(
              request.employee.name,
            )}`}
            aria-hidden="true"
          >
            {initials(request.employee.name)}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{request.employee.name}</p>
            <p className="text-xs text-muted">
              {request.employee.department} · {request.employee.email}
            </p>
          </div>
        </div>
        <LeaveStatusBadge status={request.status} />
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailRow label="Leave type">{request.leaveType}</DetailRow>
        <DetailRow label="Total days">
          {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
        </DetailRow>
        <DetailRow label="Start date">{formatDate(request.startDate)}</DetailRow>
        <DetailRow label="End date">{formatDate(request.endDate)}</DetailRow>
        <div className="sm:col-span-2">
          <DetailRow label="Requested period">{formatDateRange(request.startDate, request.endDate)}</DetailRow>
        </div>
        <div className="sm:col-span-2">
          <DetailRow label="Reason">
            <p className="rounded-lg bg-slate-50 p-3 leading-relaxed ring-1 ring-line">{request.reason}</p>
          </DetailRow>
        </div>

        {request.status === 'Rejected' && (
          <div className="sm:col-span-2">
            <DetailRow label="Rejection reason">
              <p className="rounded-lg border border-rose-100 bg-rose-50 p-3 leading-relaxed text-rose-700">
                {request.rejectionReason || 'No reason recorded.'}
              </p>
            </DetailRow>
          </div>
        )}

        <DetailRow label="Submitted">{formatDateTime(request.createdAt)}</DetailRow>
        <DetailRow label="Last updated">{formatDateTime(request.updatedAt)}</DetailRow>
      </dl>
    </Modal>
  );
}
