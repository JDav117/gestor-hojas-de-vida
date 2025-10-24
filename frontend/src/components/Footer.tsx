import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-600) 100%)', color: '#fff', marginTop: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small>© {new Date().getFullYear()} Institución Universitaria del Putumayo</small>
        <small>Desarrollado para GHV_UIP</small>
      </div>
    </footer>
  );
}
