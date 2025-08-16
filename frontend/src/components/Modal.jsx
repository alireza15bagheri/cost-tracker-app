// /home/alireza/cost-tracker/frontend/src/components/Modal.jsx
import { useEffect, useId } from 'react';
import '../styles/Modal.css';

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = 560,
}) {
  const headingId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="modal-dialog"
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? headingId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {title ? <h2 id={headingId} className="modal-title">{title}</h2> : <span />}
          <button
            type="button"
            className="modal-close"
            aria-label="Close modal"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
