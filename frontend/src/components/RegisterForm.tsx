import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', identificacion: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      await register(form);
      setOk('Usuario registrado. Ahora inicia sesión.');
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al registrar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack" style={{ minWidth: 320 }}>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="nombre" placeholder="Nombres" value={form.nombre} onChange={onChange} />
      </div>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="apellido" placeholder="Apellidos" value={form.apellido} onChange={onChange} />
      </div>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="email" placeholder="Correo electrónico" value={form.email} onChange={onChange} />
      </div>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h10" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="identificacion" placeholder="Identificación" value={form.identificacion} onChange={onChange} />
      </div>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="password" type="password" placeholder="Contraseña" value={form.password} onChange={onChange} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <span className="spinner" /> : 'Registrarme'}</button>
      {error && <div className="text-danger">{error}</div>}
  {/* Usamos toasts para mensajes de éxito, pero dejamos este por si el toast falla */}
  {ok && <div className="text-success" style={{ display: 'none' }}>{ok}</div>}
      <div className="text-muted">Al registrarte aceptas el uso de tus datos para fines del proceso de gestión de hojas de vida y convocatorias.</div>
    </form>
  );
}
