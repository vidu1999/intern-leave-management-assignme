import { useState } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import { DEPARTMENTS } from '../../utils/constants.js';
import { validateEmployee } from '../../utils/validation.js';

/**
 * Add / edit employee form. Client-side validation gives immediate feedback;
 * the parent submits to the API and the backend validates again.
 */
export default function EmployeeForm({ employee = null, onSubmit, onCancel }) {
  const isEditing = Boolean(employee);
  const [values, setValues] = useState({
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    department: employee?.department ?? '',
  });
  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiErrors((current) => ({ ...current, [field]: undefined }));
    setServerMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateEmployee(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');
    setApiErrors({});
    try {
      await onSubmit({
        name: values.name.trim().replace(/\s+/g, ' '),
        email: values.email.trim().toLowerCase(),
        department: values.department,
      });
    } catch (error) {
      setApiErrors(error?.errors || {});
      setServerMessage(error?.message || 'The employee could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (field) => errors[field] || apiErrors[field];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverMessage && !Object.keys(apiErrors).length && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-[13px] text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{serverMessage}</span>
        </div>
      )}

      <Input
        id="employee-name"
        label="Full Name"
        required
        autoComplete="name"
        placeholder="e.g. Kasun Perera"
        value={values.name}
        onChange={(event) => updateField('name', event.target.value)}
        error={fieldError('name')}
      />

      <Input
        id="employee-email"
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        placeholder="e.g. kasun.perera@omibits.com"
        value={values.email}
        onChange={(event) => updateField('email', event.target.value)}
        error={fieldError('email')}
        hint="Must be unique — it identifies the employee in the system."
      />

      <Select
        id="employee-department"
        label="Department"
        required
        placeholder="Select a department"
        options={DEPARTMENTS}
        value={values.department}
        onChange={(event) => updateField('department', event.target.value)}
        error={fieldError('department')}
      />

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" icon={Save} isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
