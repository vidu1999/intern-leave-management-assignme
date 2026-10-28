import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeForm from './EmployeeForm.jsx';

describe('EmployeeForm validation', () => {
  it('shows field specific messages when submitted empty', async () => {
    const user = userEvent.setup();
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Department is required.')).toBeInTheDocument();
  });

  it('rejects an invalid email address', async () => {
    const user = userEvent.setup();
    render(<EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/full name/i), 'Kasun Perera');
    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.selectOptions(screen.getByLabelText(/department/i), 'IT');
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
  });

  it('submits trimmed, lower-cased values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmployeeForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/full name/i), '  Kasun   Perera ');
    await user.type(screen.getByLabelText(/email address/i), 'Kasun@Example.com');
    await user.selectOptions(screen.getByLabelText(/department/i), 'Finance');
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Kasun Perera',
        email: 'kasun@example.com',
        department: 'Finance',
      }),
    );
  });

  it('shows the API error for a duplicate email address', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue({
      status: 409,
      message: 'An employee with this email address already exists.',
      errors: { email: 'An employee with this email address already exists.' },
    });
    render(<EmployeeForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/full name/i), 'Duplicate Person');
    await user.type(screen.getByLabelText(/email address/i), 'dup@example.com');
    await user.selectOptions(screen.getByLabelText(/department/i), 'IT');
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(
      await screen.findByText('An employee with this email address already exists.'),
    ).toBeInTheDocument();
  });

  it('prefills values when editing an existing employee', () => {
    render(
      <EmployeeForm
        employee={{ id: 3, name: 'Nimali Fernando', email: 'nimali@example.com', department: 'HR' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Nimali Fernando');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('nimali@example.com');
    expect(screen.getByLabelText(/department/i)).toHaveValue('HR');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});
