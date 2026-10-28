import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeaveStatusBadge from './LeaveStatusBadge.jsx';

describe('LeaveStatusBadge', () => {
  it('renders the pending status with the warning palette', () => {
    render(<LeaveStatusBadge status="Pending" />);
    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-50', 'text-amber-700');
  });

  it('renders the approved status with the success palette', () => {
    render(<LeaveStatusBadge status="Approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toHaveClass('bg-emerald-50', 'text-emerald-700');
  });

  it('renders the rejected status with the danger palette', () => {
    render(<LeaveStatusBadge status="Rejected" />);
    const badge = screen.getByText('Rejected');
    expect(badge).toHaveClass('bg-rose-50', 'text-rose-700');
  });

  it('falls back to a neutral style for an unknown status', () => {
    render(<LeaveStatusBadge status="Cancelled" />);
    expect(screen.getByText('Cancelled')).toHaveClass('bg-slate-100');
  });
});
