import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import LeaveRequestForm from './LeaveRequestForm.jsx';
import { ToastProvider } from '../../hooks/useToast.jsx';
import { SummaryProvider } from '../../hooks/useSummary.jsx';
import { createLeaveRequest } from '../../services/leaveService.js';
import { fetchSummary } from '../../services/reportService.js';

vi.mock('../../services/leaveService.js', () => ({
  createLeaveRequest: vi.fn(),
}));

vi.mock('../../services/reportService.js', () => ({
  fetchSummary: vi.fn(),
}));

const employees = [
  { id: 1, name: 'Kasun Perera', email: 'kasun@example.com', department: 'IT' },
  { id: 2, name: 'Nimali Fernando', email: 'nimali@example.com', department: 'HR' },
];

async function renderForm(props = {}) {
  let result;
  await act(async () => {
    result = render(
    <MemoryRouter>
      <ToastProvider>
        <SummaryProvider>
          <LeaveRequestForm employees={employees} employeesLoading={false} {...props} />
        </SummaryProvider>
      </ToastProvider>
    </MemoryRouter>,
    );
  });
  return result;
}

beforeEach(() => {
  fetchSummary.mockResolvedValue({
    totals: { employees: 2, leaveRequests: 0, pending: 0, approved: 0, rejected: 0 },
    byStatus: [],
    byLeaveType: [],
    recentRequests: [],
  });
});

describe('LeaveRequestForm validation', () => {
  it('shows required field messages when submitted empty', async () => {
    const user = userEvent.setup();
    await await renderForm();

    await user.click(screen.getByRole('button', { name: /submit request/i }));

    expect(screen.getByText('Select an employee.')).toBeInTheDocument();
    expect(screen.getByText('Select a leave type.')).toBeInTheDocument();
    expect(screen.getByText('Start date is required.')).toBeInTheDocument();
    expect(screen.getByText('End date is required.')).toBeInTheDocument();
    expect(screen.getByText('Please provide a reason for this leave request.')).toBeInTheDocument();
    expect(createLeaveRequest).not.toHaveBeenCalled();
  });

  it('rejects an end date before the start date without calling the API', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.selectOptions(screen.getByLabelText(/employee/i), '1');
    await user.selectOptions(screen.getByLabelText(/leave type/i), 'Annual');
    await user.type(screen.getByLabelText(/start date/i), '2026-11-10');
    await user.type(screen.getByLabelText(/end date/i), '2026-11-04');
    await user.type(screen.getByLabelText(/reason/i), 'Family trip');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    expect(screen.getByText('End date must be on or after the start date.')).toBeInTheDocument();
    expect(createLeaveRequest).not.toHaveBeenCalled();
  });

  it('submits a valid request to the API', async () => {
    const user = userEvent.setup();
    createLeaveRequest.mockResolvedValue({
      success: true,
      data: { id: 21, status: 'Pending', employee: { name: 'Kasun Perera' } },
    });
    await renderForm();

    await user.selectOptions(screen.getByLabelText(/employee/i), '1');
    await user.selectOptions(screen.getByLabelText(/leave type/i), 'Medical');
    await user.type(screen.getByLabelText(/start date/i), '2026-12-01');
    await user.type(screen.getByLabelText(/end date/i), '2026-12-03');
    await user.type(screen.getByLabelText(/reason/i), '  Dental surgery  ');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() =>
      expect(createLeaveRequest).toHaveBeenCalledWith({
        employeeId: 1,
        leaveType: 'Medical',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        reason: 'Dental surgery',
      }),
    );
    expect(await screen.findByText(/request created/i)).toBeInTheDocument();
  });

  it('displays backend validation errors returned by the API', async () => {
    const user = userEvent.setup();
    createLeaveRequest.mockRejectedValue({
      status: 400,
      message: 'The selected employee does not exist.',
      errors: { employeeId: 'The selected employee does not exist.' },
    });
    await renderForm();

    await user.selectOptions(screen.getByLabelText(/employee/i), '2');
    await user.selectOptions(screen.getByLabelText(/leave type/i), 'Casual');
    await user.type(screen.getByLabelText(/start date/i), '2026-12-01');
    await user.type(screen.getByLabelText(/end date/i), '2026-12-01');
    await user.type(screen.getByLabelText(/reason/i), 'Personal errand');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    const messages = await screen.findAllByText('The selected employee does not exist.');
    expect(messages.length).toBeGreaterThan(0);
  });

  it('disables submission when no employees exist', async () => {
    await renderForm({ employees: [] });
    expect(screen.getByRole('button', { name: /submit request/i })).toBeDisabled();
    expect(screen.getByText(/no employees exist yet/i)).toBeInTheDocument();
  });
});
