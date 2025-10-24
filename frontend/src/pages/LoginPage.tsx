import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 24, display: 'grid', justifyContent: 'center' }}>
      <div style={{ maxWidth: 380 }}>
        <h1 style={{ marginBottom: 12 }}>Iniciar sesión</h1>
        <LoginForm onSuccess={() => nav('/perfil')} />
        <p style={{ marginTop: 12 }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
