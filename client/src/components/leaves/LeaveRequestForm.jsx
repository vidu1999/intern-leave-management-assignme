import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CalendarPlus, Send, UserRoundPlus } from 'lucide-react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Textarea from '../common/Textarea.jsx';
import { createLeaveRequest } from '../../services/leaveService.js';
import { LEAVE_TYPES } from '../../utils/constants.js';
import { validateLeaveRequest } from '../../utils/validation.js';
import { useToast } from '../../hooks/useToast.jsx';
import { useSummary } from '../../hooks/useSummary.jsx';

const EMPTY_VALUES = { employeeId: '', leaveType: '', startDate: '', endDate: '', reason: '' };

/**
 * Leave request form (left column of the Submit Leave Request page).
 * Performs client-side validation for fast feedback, then POSTs to the API
 * which validates the same rules again before writing to SQLite.
 */
export default function LeaveRequestForm({ employees = [], employeesLoading, employeesError, onSubmitted }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { refreshSummary } = useSummary();
  const navigate = useNavigate();

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: String(employee.id),
        label: `${employee.name} · ${employee.department}`,
      })),
    [employees],
  );

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setServerError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateLeaveRequest(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(`leave-${firstField}`)?.focus?.();
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        employeeId: Number(values.employeeId),
        leaveType: values.leaveType,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason.trim(),
      };
      const response = await createLeaveRequest(payload);
      toast.success('Leave request submitted and saved as Pending.', {
        title: 'Request created',
      });
      setValues(EMPTY_VALUES);
      setErrors({});
      refreshSummary();
      onSubmitted?.(response.data);
    } catch (error) {
      setErrors(error.errors || {});
      setServerError(error.message);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setServerError(null);
    navigate('/leaves');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-[13px] text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      <Select
        id="leave-employeeId"
        label="Employee"
        required
        placeholder={employeesLoading ? 'Loading employees…' : 'Select an employee'}
        options={employeeOptions}
        value={values.employeeId}
        onChange={(event) => updateField('employeeId', event.target.value)}
        error={errors.employeeId}
        disabled={employeesLoading || employees.length === 0}
        hint={employeesError ? 'Employees could not be loaded. Please refresh the page.' : undefined}
      />

      {!employeesLoading && employees.length === 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13px] text-amber-800">
          <UserRoundPlus className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            No employees exist yet, so a leave request cannot be submitted.{' '}
            <Link to="/employees" className="font-semibold underline decoration-amber-400 underline-offset-2">
              Add an employee
            </Link>{' '}
            first.
          </p>
        </div>
      )}

      <Select
        id="leave-leaveType"
        label="Leave Type"
        required
        placeholder="Select a leave type"
        options={LEAVE_TYPES}
        value={values.leaveType}
        onChange={(event) => updateField('leaveType', event.target.value)}
        error={errors.leaveType}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="leave-startDate"
          label="Start Date"
          type="date"
          required
          value={values.startDate}
          onChange={(event) => updateField('startDate', event.target.value)}
          error={errors.startDate}
        />
        <Input
          id="leave-endDate"
          label="End Date"
          type="date"
          required
          min={values.startDate || undefined}
          value={values.endDate}
          onChange={(event) => updateField('endDate', event.target.value)}
          error={errors.endDate}
        />
      </div>

      <Textarea
        id="leave-reason"
        label="Reason"
        required
        rows={5}
        maxLength={500}
        showCounter
        placeholder="Briefly describe why this leave is required."
        value={values.reason}
        onChange={(event) => updateField('reason', event.target.value)}
        error={errors.reason}
        hint="Visible to HR when the request is reviewed."
      />

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting} className="sm:min-w-[96px]">
          Cancel
        </Button>
        <Button
          type="submit"
          icon={Send}
          isLoading={isSubmitting}
          disabled={employees.length === 0}
          className="sm:min-w-[160px]"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Request'}
        </Button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
        New requests are always saved with the status <span className="ml-1 font-medium text-ink">Pending</span>
      </p>
    </form>
  );
}
