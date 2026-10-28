import { useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Modal from '../components/common/Modal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmployeeForm from '../components/employees/EmployeeForm.jsx';
import EmployeeTable from '../components/employees/EmployeeTable.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { createEmployee, deleteEmployee, updateEmployee } from '../services/employeeService.js';
import { useEmployees } from '../hooks/useEmployees.js';
import { useToast } from '../hooks/useToast.jsx';
import { useSummary } from '../hooks/useSummary.jsx';
import { pluralise } from '../utils/format.js';

/** Employee management: search, create, edit and guarded delete. */
export default function EmployeesPage() {
  const { employees, loading, error, search, setSearch, refresh } = useEmployees();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const { refreshSummary } = useSummary();

  const openCreateForm = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = async (values) => {
    if (editingEmployee) {
      const response = await updateEmployee(editingEmployee.id, values);
      toast.success(`${response.data.name} was updated.`, { title: 'Employee updated' });
    } else {
      const response = await createEmployee(values);
      toast.success(`${response.data.name} was added to the directory.`, { title: 'Employee added' });
    }
    closeForm();
    refresh();
    refreshSummary();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast.success(`${deleteTarget.name} was deleted.`, { title: 'Employee deleted' });
      setDeleteTarget(null);
      refresh();
      refreshSummary();
    } catch (apiError) {
      toast.error(apiError.message, { title: 'Could not delete employee' });
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Manage your company employees."
        actions={
          <Button icon={UserPlus} onClick={openCreateForm}>
            Add Employee
          </Button>
        }
      />

      <Card
        noPadding
        title="Employee Directory"
        subtitle={
          loading
            ? 'Loading employees…'
            : `${pluralise(employees.length, 'employee')}${search ? ' matching your search' : ' on record'}`
        }
        action={
          <Input
            placeholder="Search employees…"
            icon={Search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search employees"
            className="w-full sm:w-64"
          />
        }
      >
        {loading && employees.length === 0 ? (
          <LoadingSpinner label="Loading employees…" className="py-16" />
        ) : (
          <EmployeeTable
            employees={employees}
            loading={loading}
            error={error}
            onRetry={refresh}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
            searchTerm={search}
            emptyAction={
              <Button icon={UserPlus} onClick={openCreateForm}>
                Add your first employee
              </Button>
            }
          />
        )}

        {!loading && !error && employees.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-line px-4 py-3 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing <span className="font-medium text-ink">{employees.length}</span>{' '}
              {employees.length === 1 ? 'employee' : 'employees'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Employees with leave history cannot be deleted.
            </span>
          </div>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        description={
          editingEmployee
            ? 'Update the employee details below. Changes are saved to the database.'
            : 'Add a team member so leave requests can be submitted for them.'
        }
        icon={UserPlus}
        size="md"
      >
        {formOpen && (
          <EmployeeForm
            key={editingEmployee?.id ?? 'new'}
            employee={editingEmployee}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete employee?"
        description={
          deleteTarget
            ? `This permanently removes ${deleteTarget.name} from the directory. Employees with leave requests cannot be deleted.`
            : undefined
        }
        confirmLabel="Delete Employee"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        {deleteTarget && (
          <div className="rounded-lg border border-line bg-slate-50 px-3.5 py-3 text-[13px]">
            <p className="font-medium text-ink">{deleteTarget.name}</p>
            <p className="mt-0.5 text-muted">
              {deleteTarget.email} · {deleteTarget.department}
            </p>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
