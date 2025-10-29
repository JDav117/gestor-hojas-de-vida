import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useLocation } from 'react-router-dom';

export default function ForbiddenPage() {
  const location = useLocation();
  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main className="admin-container fade-in-up" style={{ width: '100%', flex: 1, display: 'grid', placeItems: 'center' }}>
        <div className="section-card" style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#b91c1c' }}>403</div>
          <h2 style={{ marginBottom: 8 }}>Acceso denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Link className="btn" to="/">Ir al inicio</Link>
            <Link className="btn btn-primary" to="/perfil">Ir a mi perfil</Link>
          </div>
          <div className="text-muted" style={{ marginTop: 8, fontSize: 12 }}>Ruta: {location.pathname}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
