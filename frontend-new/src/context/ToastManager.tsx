import React, { useEffect } from 'react';
import { useToast } from './ToastContext';

const typeColor: Record<string, string> = {
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  warning: '#f59e0b',
};

export default function ToastManager() {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map(toast =>
      setTimeout(() => removeToast(toast.id), 3000)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{
          padding: 10,
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minWidth: 240,
          borderLeft: `4px solid ${typeColor[toast.type] || typeColor.info}`,
        }}>
          <span style={{ color: '#111827' }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
