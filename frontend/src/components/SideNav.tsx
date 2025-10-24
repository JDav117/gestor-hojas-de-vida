import React, { useEffect } from 'react';

export type NavItem = {
  key: string;
  label: string;
  onClick: () => void;
};

export default function SideNav({ open, onClose, items, title = 'Menú de navegación', width = 300, side = 'left' }: { open: boolean; onClose: () => void; items: NavItem[]; title?: string; width?: number; side?: 'left' | 'right'; }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  const isRight = side === 'right';
  return (
    <div className="sidenav-root" onClick={onClose}>
      <div className="sidenav-overlay" />
      <div
        className="sidenav"
        style={{
          width,
          position: 'absolute',
          top: 0,
          height: '100vh',
          background: '#fff',
          ...(isRight
            ? { right: 0, borderLeft: '1px solid var(--border)', boxShadow: '-16px 0 40px rgba(0,0,0,0.12)' }
            : { left: 0, borderRight: '1px solid var(--border)', boxShadow: '16px 0 40px rgba(0,0,0,0.12)' }
          )
        }}
        onClick={(e)=> e.stopPropagation()}
      >
        <div className="sidenav-header">
          <div style={{ fontWeight: 700 }}> {title} </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <nav className="sidenav-body">
          {items.map(it => (
            <button key={it.key} className="sidenav-link" onClick={it.onClick}>{it.label}</button>
          ))}
        </nav>
      </div>
    </div>
  );
}
