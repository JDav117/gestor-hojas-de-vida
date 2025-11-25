import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterForm({ onSuccess, title = 'Formulario de registro', showTitle = true }: { onSuccess?: () => void; title?: string; showTitle?: boolean }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', identificacion: '', telefono: '', password: '', confirmPassword: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<string>('');

  // Validar fortaleza de contraseña
  function validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Mínimo 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos una mayúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos una minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos un número' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Debe contener al menos un carácter especial (!@#$%^&*)' };
    }
    return { isValid: true, message: 'Contraseña segura ✓' };
  }
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validar contraseña en tiempo real
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordStrength(validation.message);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    
    // Validar email (solo formato básico en desarrollo)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Formato de email inválido');
      return;
    }
    
    // Validar fortaleza de contraseña
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      setError(`Contraseña débil: ${passwordValidation.message}`);
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    // Validar términos y condiciones
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }
    
    setBusy(true);
    try {
      // Enviar solo los campos necesarios (sin confirmPassword)
      const { confirmPassword, ...registerData } = form;
      await register(registerData);
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
      {showTitle && <h3 className="modal-title">{title}</h3>}
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
        <input className="input" name="identificacion" placeholder="Identificación" value={form.identificacion} onChange={onChange} required />
      </div>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="telefono" type="tel" placeholder="Teléfono (opcional)" value={form.telefono} onChange={onChange} />
      </div>
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="password" type="password" placeholder="Contraseña" value={form.password} onChange={onChange} required minLength={8} />
      </div>
      {form.password && (
        <div style={{ fontSize: '0.85rem', marginTop: '-0.5rem', color: passwordStrength.includes('✓') ? '#10b981' : '#6b7280' }}>
          {passwordStrength}
        </div>
      )}
      <div className="input-group">
        <span className="input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>
        <input className="input" name="confirmPassword" type="password" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={onChange} required minLength={8} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.5rem 0' }}>
        <input 
          type="checkbox" 
          id="terms" 
          checked={acceptedTerms} 
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          required
          style={{ marginTop: '0.25rem', cursor: 'pointer' }}
        />
        <label htmlFor="terms" style={{ fontSize: '0.9rem', lineHeight: '1.4', cursor: 'pointer' }}>
          Acepto los <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>términos y condiciones</a> y la <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>política de privacidad</a>
        </label>
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <span className="spinner" /> : 'Registrarme'}</button>
      {error && <div className="text-danger">{error}</div>}
  {/* Usamos toasts para mensajes de éxito, pero dejamos este por si el toast falla */}
  {ok && <div className="text-success" style={{ display: 'none' }}>{ok}</div>}
    </form>
  );
}
