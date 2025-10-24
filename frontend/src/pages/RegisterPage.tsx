import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 24, display: 'grid', justifyContent: 'center' }}>
      <div style={{ maxWidth: 380 }}>
        <h1 style={{ marginBottom: 12 }}>Registro</h1>
        <RegisterForm onSuccess={() => setTimeout(() => nav('/login'), 800)} />
        <p style={{ marginTop: 12 }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
