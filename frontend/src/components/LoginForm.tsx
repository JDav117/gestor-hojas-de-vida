import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { show } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack" style={{ minWidth: 320 }}>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <a
          className="link"
          href="#"
          onClick={(e) => { e.preventDefault(); show('Funcionalidad de recuperación disponible próximamente.', 'info'); }}
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <span className="spinner" /> : 'Ingresar'}</button>
      {error && <div className="text-danger">{error}</div>}
    </form>
  );
}
