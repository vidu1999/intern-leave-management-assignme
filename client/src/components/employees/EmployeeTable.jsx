import { Mail, Pencil, Trash2, Users } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import { DEPARTMENT_STYLES } from '../../utils/constants.js';
import { avatarClasses, employeeCode, initials } from '../../utils/format.js';

function SkeletonRows() {
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: 5 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-3.5">
              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${50 + ((rowIndex * 17 + cellIndex * 11) % 40)}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/** Employee directory table with edit and delete actions. */
export default function EmployeeTable({
  employees = [],
  loading = false,
  error = null,
  onRetry,
  onEdit,
  onDelete,
  emptyAction,
  searchTerm = '',
}) {
  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error.message} onRetry={onRetry} />
      </div>
    );
  }

  if (!loading && employees.length === 0) {
    return searchTerm ? (
      <EmptyState
        icon={Users}
        title="No employees match your search"
        description={`Nothing found for “${searchTerm}”. Try a different name, email address or department.`}
      />
    ) : (
      <EmptyState
        icon={Users}
        title="No employees yet"
        description="Add your first employee to start managing leave requests."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="overflow-x-auto scroll-area">
      <table className="data-table min-w-[780px]">
        <thead>
          <tr>
            <th scope="col">Employee ID</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Department</th>
            <th scope="col" className="text-right">Actions</th>
          </tr>
        </thead>

        {loading ? (
          <SkeletonRows />
        ) : (
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="whitespace-nowrap font-medium text-muted">{employeeCode(employee.id)}</td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarClasses(
                        employee.name,
                      )}`}
                      aria-hidden="true"
                    >
                      {initials(employee.name)}
                    </span>
                    <span className="font-medium text-ink">{employee.name}</span>
                  </div>
                </td>
                <td>
                  <a
                    href={`mailto:${employee.email}`}
                    className="inline-flex items-center gap-1.5 text-muted transition hover:text-brand"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {employee.email}
                  </a>
                </td>
                <td>
                  <Badge className={DEPARTMENT_STYLES[employee.department] || 'bg-slate-100 text-slate-600 ring-slate-200'}>
                    {employee.department}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit?.(employee)}
                      aria-label={`Edit ${employee.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-brand-50 hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(employee)}
                      aria-label={`Delete ${employee.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
