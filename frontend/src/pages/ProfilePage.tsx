import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const initials = `${user?.nombre?.[0] || ''}${user?.apellido?.[0] || ''}`.toUpperCase();
  const roles = (user?.roles || []).map((r: any) => r.nombre_rol);
  const roleNames = (user?.roles || []).map((r: any) => String(r?.nombre_rol ?? r).toLowerCase());
  const isAdmin = roleNames.includes('admin');
  const isPostulante = roleNames.includes('postulante');
  const isEvaluador = isAdmin || roleNames.includes('evaluador');
  // Rol efectivo (modelo de un solo rol por usuario). Si viniera más de uno desde backend, usamos un desempate simple.
  const effectiveRole: 'admin' | 'evaluador' | 'postulante' | 'none' =
    isAdmin ? 'admin' : (roleNames.includes('evaluador') ? 'evaluador' : (roleNames.includes('postulante') ? 'postulante' : 'none'));
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'datos' | 'password'>('datos');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: user?.nombre || '', apellido: user?.apellido || '', email: user?.email || '', identificacion: user?.identificacion || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const { updateProfile, changePassword } = useAuth();
  const [counts, setCounts] = useState<{ postulaciones?: number | null; evaluaciones?: number | null }>({});
  // Blocks for Drawer (defined once to reuse in prioritized rendering)
  const PostulacionesBlock = (
    <div className="fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 600 }}>Mis postulaciones</div>
        <div className="text-muted">Consulta tus postulaciones y documentos.</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip" title="Total">
          {counts.postulaciones === undefined ? '—' : counts.postulaciones === null ? 'N/A' : counts.postulaciones}
        </span>
        <Link className="btn" to="/mis-postulaciones">Ir</Link>
      </div>
    </div>
  );
  const EvaluacionesBlock = (
    <div className="fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 600 }}>Mis evaluaciones</div>
        <div className="text-muted">Revisa las asignadas y registra resultados.</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip" title="Total">
          {counts.evaluaciones === undefined ? '—' : counts.evaluaciones === null ? 'N/A' : counts.evaluaciones}
        </span>
        <Link className="btn" to="/mis-evaluaciones">Ir</Link>
      </div>
    </div>
  );
  const AdminBlock = (
    <div className="fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 600 }}>Administración</div>
        <div className="text-muted">Gestiona convocatorias, ítems, baremos y asignaciones.</div>
      </div>
      <Link className="btn" to="/admin">Ir</Link>
    </div>
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const nextCounts: { postulaciones?: number | null; evaluaciones?: number | null } = {};
      try {
        // /postulaciones está protegido pero accesible para admin, evaluador (asignadas) y postulante (propias)
        const resP = await api.get('/postulaciones');
        nextCounts.postulaciones = Array.isArray(resP.data) ? resP.data.length : 0;
      } catch (_) {
        nextCounts.postulaciones = null;
      }
      if (isEvaluador || isAdmin) {
        try {
          const resE = await api.get('/evaluaciones');
          nextCounts.evaluaciones = Array.isArray(resE.data) ? resE.data.length : 0;
        } catch (_) {
          nextCounts.evaluaciones = null;
        }
      }
      if (!cancelled) setCounts(nextCounts);
    }
    load();
    return () => { cancelled = true; };
  }, [isAdmin, isEvaluador]);
  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'grid', placeItems: 'start center', padding: 20 }}>
        <div className="card" style={{ width: '100%', maxWidth: 720 }}>
          <div className="card-header">
            <div className="avatar">{initials || 'U'}</div>
            <div>
              <h2 style={{ margin: 0 }}>{user?.nombre} {user?.apellido}</h2>
              <div className="muted">{user?.email}</div>
            </div>
          </div>
          <div className="grid grid-2">
            <div>
              <div className="muted">Identificación</div>
              <div>{user?.identificacion || '—'}</div>
            </div>
            <div>
              <div className="muted">Roles</div>
              <div className="chips">
                {roles.length > 0 ? roles.map((r: string) => (
                  <span key={r} className={`chip ${r === 'admin' ? 'badge-admin' : ''}`}>{r}</span>
                )) : <span className="muted">N/A</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn" onClick={() => setEditing(true)}>Editar perfil</button>
          </div>
        </div>

        {/* Accesos rápidos según rol integrados en la página */}
        <div className="card" style={{ width: '100%', maxWidth: 720, marginTop: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Accesos rápidos</h3>
          <div className="grid" style={{ gap: 16 }}>
            {effectiveRole === 'admin' && AdminBlock}
            {effectiveRole === 'evaluador' && EvaluacionesBlock}
            {effectiveRole === 'postulante' && PostulacionesBlock}
            {effectiveRole === 'none' && (
              <div className="text-muted">Tu cuenta aún no tiene roles asociados. Contacta al administrador.</div>
            )}
            {/* Acción de editar perfil siempre disponible */}
            <div className="fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Editar perfil</div>
                <div className="text-muted">Actualiza tu información personal.</div>
              </div>
              <button className="btn" onClick={() => setEditing(true)}>Abrir</button>
            </div>
          </div>
        </div>
      </main>
      {editing && (
        <div className="overlay" style={{ display: 'grid', placeItems: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '95%', maxWidth: 520, position: 'relative' }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Editar perfil</h3>
              <button className="btn-ghost" onClick={() => setEditing(false)} aria-label="Cerrar">✕</button>
            </div>
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button className={`tab ${tab==='datos'?'active':''}`} onClick={()=> setTab('datos')} type="button">Datos</button>
              <button className={`tab ${tab==='password'?'active':''}`} onClick={()=> setTab('password')} type="button">Contraseña</button>
            </div>
            {tab==='datos' ? (
            <form className="stack" onSubmit={async(e)=>{e.preventDefault(); setBusy(true); setError(null); setOk(null); try{ await updateProfile(form); setOk('Datos actualizados'); }catch(err:any){ setError(err?.response?.data?.message || 'No se pudo actualizar'); } finally { setBusy(false);} }}>
              <div className="input-group">
                <span className="input-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input className="input" placeholder="Nombre" value={form.nombre} onChange={(e)=> setForm({...form, nombre: e.target.value})} required />
              </div>
              <div className="input-group">
                <span className="input-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input className="input" placeholder="Apellido" value={form.apellido} onChange={(e)=> setForm({...form, apellido: e.target.value})} required />
              </div>
              <div className="input-group">
                <span className="input-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e)=> setForm({...form, email: e.target.value})} required />
              </div>
              <div className="input-group">
                <span className="input-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h10" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input className="input" placeholder="Identificación" value={form.identificacion} onChange={(e)=> setForm({...form, identificacion: e.target.value})} />
              </div>
              {error && <div className="text-danger">{error}</div>}
              {ok && <div className="text-success">{ok}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn" onClick={()=> setEditing(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner"/> : 'Guardar cambios'}</button>
              </div>
            </form>
            ) : (
            <form className="stack" onSubmit={async(e)=>{e.preventDefault(); setBusy(true); setError(null); setOk(null); if(pwd.newPassword !== pwd.confirm){ setError('La confirmación no coincide'); setBusy(false); return;} try{ await changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }); setOk('Contraseña actualizada. Por seguridad, volverás a iniciar sesión.'); setPwd({ currentPassword:'', newPassword:'', confirm:''}); setTimeout(()=>{ logout(); }, 700); }catch(err:any){ setError(err?.response?.data?.message || 'No se pudo cambiar la contraseña'); } finally { setBusy(false);} }}>
              <div className="input-group">
                <span className="input-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input className="input" placeholder="Contraseña actual" type="password" value={pwd.currentPassword} onChange={(e)=> setPwd({...pwd, currentPassword: e.target.value})} required />
              </div>
              <div className="input-group">
                <span className="input-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input className="input" placeholder="Nueva contraseña" type="password" value={pwd.newPassword} onChange={(e)=> setPwd({...pwd, newPassword: e.target.value})} required />
              </div>
              <div className="input-group">
                <span className="input-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
                <input className="input" placeholder="Confirmar nueva contraseña" type="password" value={pwd.confirm} onChange={(e)=> setPwd({...pwd, confirm: e.target.value})} required />
              </div>
              {error && <div className="text-danger">{error}</div>}
              {ok && <div className="text-success">{ok}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn" onClick={()=> setEditing(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner"/> : 'Actualizar contraseña'}</button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
