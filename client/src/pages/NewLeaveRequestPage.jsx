import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, HeartPulse, Info, Palmtree } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import LeaveRequestForm from '../components/leaves/LeaveRequestForm.jsx';
import { buttonClasses } from '../components/common/Button.jsx';
import { useEmployees } from '../hooks/useEmployees.js';

const LEAVE_TYPE_CARDS = [
  {
    name: 'Annual',
    icon: Palmtree,
    className: 'bg-brand-50 text-brand ring-brand-100',
    description: 'Paid leave for vacation and planned time off.',
  },
  {
    name: 'Casual',
    icon: CalendarDays,
    className: 'bg-violet-50 text-accent ring-violet-100',
    description: 'Short-term leave for personal matters.',
  },
  {
    name: 'Medical',
    icon: HeartPulse,
    className: 'bg-emerald-50 text-success ring-emerald-100',
    description: 'Leave taken for health and recovery reasons.',
  },
];

/** Submit Leave Request - form on the left, guidance cards on the right. */
export default function NewLeaveRequestPage() {
  const { employees, loading, error } = useEmployees();

  return (
    <>
      <PageHeader
        title="Submit Leave Request"
        subtitle="Fill in the details below to request time off."
        actions={
          <Link to="/leaves" className={buttonClasses({ variant: 'secondary', size: 'md' })}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to requests
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Leave Request Details" subtitle="All fields marked with * are required">
            <LeaveRequestForm employees={employees} employeesLoading={loading} employeesError={error} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Leave Types" subtitle="Available leave categories">
            <ul className="space-y-4">
              {LEAVE_TYPE_CARDS.map((type) => {
                const Icon = type.icon;
                return (
                  <li key={type.name} className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${type.className}`}>
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{type.name}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{type.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-semibold text-amber-900">Important</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-amber-800">
                  End date must be on or after the start date.
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-amber-700">
                  Submitted requests start as Pending and are reviewed by HR before a decision is made.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
