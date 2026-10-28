import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/** Reusable confirmation dialog for decisions that change data. */
export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={isLoading ? () => {} : onCancel}
      title={title}
      description={description}
      size="sm"
      icon={AlertTriangle}
      iconClassName={
        variant === 'danger'
          ? 'bg-rose-50 text-danger ring-rose-100'
          : 'bg-emerald-50 text-success ring-emerald-100'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
