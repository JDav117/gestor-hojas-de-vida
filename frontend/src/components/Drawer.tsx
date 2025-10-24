import React, { useEffect } from 'react';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  width?: number | string;
  children: React.ReactNode;
  title?: string;
};

export default function Drawer({ open, onClose, width = 380, children, title }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="drawer-root" onClick={onClose}>
      <div className="drawer-overlay" />
      <div className="drawer" style={{ width }} onClick={(e)=> e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ fontWeight: 600 }}>{title}</div>
          <button className="btn-ghost" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
}
