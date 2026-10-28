import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RejectLeaveModal from './RejectLeaveModal.jsx';

const request = {
  id: 9,
  employee: { id: 1, name: 'Kasun Perera', email: 'kasun@example.com', department: 'IT' },
  leaveType: 'Annual',
  startDate: '2026-11-02',
  endDate: '2026-11-06',
  reason: 'Family vacation',
  status: 'Pending',
};

const offlineMessage =
  'Cannot reach the LeaveManager API. Start the backend with npm run dev inside the server/ folder.';

describe('RejectLeaveModal', () => {
  it('shows the employee, leave type and requested date range', () => {
    render(<RejectLeaveModal open request={request} onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /reject leave request/i })).toBeInTheDocument();
    expect(screen.getByText('Kasun Perera')).toBeInTheDocument();
    expect(screen.getByText('Annual')).toBeInTheDocument();
    expect(screen.getByText('02 Nov 2026 – 06 Nov 2026')).toBeInTheDocument();
  });

  it('requires a rejection reason before submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RejectLeaveModal open request={request} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /reject request/i }));

    expect(screen.getByText('A rejection reason is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the trimmed rejection reason', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RejectLeaveModal open request={request} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/rejection reason/i), '  Insufficient staffing  ');
    await user.click(screen.getByRole('button', { name: /reject request/i }));

    expect(onSubmit).toHaveBeenCalledWith('Insufficient staffing');
  });

  it('keeps focus in the reason field while typing', async () => {
    const user = userEvent.setup();
    render(<RejectLeaveModal open request={request} onClose={vi.fn()} onSubmit={vi.fn()} />);

    const textarea = screen.getByLabelText(/rejection reason/i);
    await user.click(textarea);
    await user.type(textarea, 'Staffing conflict');

    // Regression guard: the dialog must not steal focus after it has settled.
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(textarea).toHaveValue('Staffing conflict');
    expect(document.activeElement).toBe(textarea);
  });

  it('shows an API or network error as a banner, not as a field error', () => {
    render(
      <RejectLeaveModal
        open
        request={request}
        error={offlineMessage}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    // The failure is announced separately from the reason field...
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('The request was not saved.');
    expect(alert).toHaveTextContent(/Cannot reach the LeaveManager API/);

    // ...and must NOT be attached to the textarea as a validation message.
    const textarea = screen.getByLabelText(/rejection reason/i);
    expect(textarea).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('A rejection reason is required.')).not.toBeInTheDocument();
  });

  it('still validates the field independently of a server error', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <RejectLeaveModal
        open
        request={request}
        error="The request was not saved."
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: /reject request/i }));

    expect(screen.getByText('A rejection reason is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('closes when Cancel is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RejectLeaveModal open request={request} onClose={onClose} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
