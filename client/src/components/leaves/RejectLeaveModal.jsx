import { useEffect, useState } from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Textarea from '../common/Textarea.jsx';
import { formatDateRange, leaveRequestCode } from '../../utils/format.js';

/**
 * Rejection dialog: shows the request being declined and requires a reason.
 * The backend validates the same rule independently.
 *
 * Two error channels are kept strictly apart:
 *   * `fieldError`  - what the user typed is wrong (empty / too long)
 *   * `error`       - the request itself failed (network, conflict, 500)
 * Mixing them made a backend outage look like an invalid textarea.
 */
export default function RejectLeaveModal({ open, request, isLoading, error, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setFieldError('');
    }
  }, [open, request?.id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setFieldError('A rejection reason is required.');
      return;
    }
    if (trimmed.length > 500) {
      setFieldError('Rejection reason must be 500 characters or fewer.');
      return;
    }
    setFieldError('');
    onSubmit(trimmed);
  };

  if (!request) return null;

  return (
    <Modal
      open={open}
      onClose={isLoading ? () => {} : onClose}
      title="Reject leave request"
      description="The employee will see this reason together with the rejected status."
      icon={XCircle}
      iconClassName="bg-rose-50 text-danger ring-rose-100"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} isLoading={isLoading} type="button">
            Reject Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-5 rounded-xl border border-line bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">{request.employee.name}</p>
              <p className="text-xs text-muted">{request.employee.department}</p>
            </div>
            <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-muted ring-1 ring-line">
              {leaveRequestCode(request.id)}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted">Leave type</dt>
              <dd className="mt-0.5 font-medium text-ink">{request.leaveType}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted">Requested dates</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {formatDateRange(request.startDate, request.endDate)}
              </dd>
            </div>
          </dl>
        </div>

        <Textarea
          label="Rejection reason"
          required
          rows={4}
          maxLength={500}
          showCounter
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            if (fieldError) setFieldError('');
          }}
          error={fieldError}
          placeholder="Explain why this request cannot be approved, for example: insufficient staffing during the requested period."
        />

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-[13px] text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-semibold">The request was not saved.</span> {error}
            </span>
          </div>
        )}
      </form>
    </Modal>
  );
}
