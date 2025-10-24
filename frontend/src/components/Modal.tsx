import React, { useEffect } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
};

export default function Modal({ open, onClose, children, width = 460 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // optional: lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-root">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}
