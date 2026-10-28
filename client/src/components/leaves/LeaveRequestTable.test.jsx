import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeaveRequestTable from './LeaveRequestTable.jsx';

const employee = { id: 2, name: 'Nimali Fernando', email: 'nimali@example.com', department: 'HR' };

const pendingRequest = {
  id: 11,
  employeeId: employee.id,
  employee,
  leaveType: 'Annual',
  startDate: '2026-11-02',
  endDate: '2026-11-06',
  reason: 'Family vacation',
  status: 'Pending',
  rejectionReason: null,
};

const approvedRequest = {
  ...pendingRequest,
  id: 12,
  status: 'Approved',
};

const rejectedRequest = {
  ...pendingRequest,
  id: 13,
  status: 'Rejected',
  rejectionReason: 'Insufficient staffing during the requested period.',
};

describe('LeaveRequestTable', () => {
  it('shows approve and reject controls only for pending requests', () => {
    render(
      <LeaveRequestTable
        requests={[pendingRequest, approvedRequest, rejectedRequest]}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onView={vi.fn()}
      />,
    );

    // Desktop table and the mobile card list each render one pending row.
    expect(screen.getAllByRole('button', { name: /approve/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /reject/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /view/i })).toHaveLength(6);
    // Rendered by both the desktop table and the mobile card list.
    expect(
      screen.getAllByText(/Insufficient staffing during the requested period\./).length,
    ).toBeGreaterThan(0);
  });

  it('calls onApprove with the selected request', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(<LeaveRequestTable requests={[pendingRequest]} onApprove={onApprove} onReject={vi.fn()} />);

    await user.click(screen.getAllByRole('button', { name: /approve/i })[0]);

    expect(onApprove).toHaveBeenCalledWith(pendingRequest);
  });

  it('calls onReject with the selected request', async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();
    render(<LeaveRequestTable requests={[pendingRequest]} onApprove={vi.fn()} onReject={onReject} />);

    await user.click(screen.getAllByRole('button', { name: /reject/i })[0]);

    expect(onReject).toHaveBeenCalledWith(pendingRequest);
  });

  it('renders an empty state when there are no requests', () => {
    render(<LeaveRequestTable requests={[]} loading={false} />);
    expect(screen.getByText('No leave requests found')).toBeInTheDocument();
  });

  it('renders an error message with a retry action', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <LeaveRequestTable
        requests={[]}
        error={{ message: 'Cannot reach the LeaveManager API.' }}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('Cannot reach the LeaveManager API.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});
