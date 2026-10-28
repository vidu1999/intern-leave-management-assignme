import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from '../components/common/Toast.jsx';

const ToastContext = createContext(null);

let nextToastId = 1;

/** Application-wide toast notifications (success / error / info). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message, { variant = 'success', title, duration = 4500 } = {}) => {
      const id = nextToastId++;
      setToasts((current) => [...current, { id, message, variant, title }]);
      const timer = setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      success: (message, options) => showToast(message, { ...options, variant: 'success' }),
      error: (message, options) => showToast(message, { ...options, variant: 'error' }),
      info: (message, options) => showToast(message, { ...options, variant: 'info' }),
    }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-3 top-3 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:top-5"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider.');
  }
  return context;
}
