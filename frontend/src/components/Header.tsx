import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConvocatoriasPanel from './ConvocatoriasPanel';
import SideNav from './SideNav';
import Modal from './Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function Header({ onOpenAuth, showAuthButton = true }: { onOpenAuth?: () => void; showAuthButton?: boolean }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';
  const onProfile = location.pathname === '/perfil';
  const onConvocatorias = location.pathname === '/convocatorias';
  const [openConv, setOpenConv] = useState(false);
  const [openNav, setOpenNav] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  // Configuración: coloca el botón del menú a la izquierda (true) o a la derecha (false)
  // Usar un booleano evita el error TS2367 por comparación de literales inalcanzable
  const MENU_BUTTON_ON_LEFT = false;

  // Permite abrir el modal de auth desde cualquier página via CustomEvent
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ mode?: 'login' | 'register'; next?: string }>).detail || {} as any;
      const mode = detail.mode ?? 'login';
      const next = detail.next as string | undefined;
      if (next) {
        try { sessionStorage.setItem('auth_next', next); } catch {}
      }
      setAuthTab(mode);
      setAuthOpen(true);
    };
    window.addEventListener('open-auth-modal', handler as EventListener);
    return () => window.removeEventListener('open-auth-modal', handler as EventListener);
  }, []);

  const navItems = useMemo(() => {
    const roleNames = (user?.roles || []).map((r: any) => String(r?.nombre_rol ?? r).toLowerCase());
    const isAdmin = roleNames.includes('admin');
    const isEvaluador = roleNames.includes('evaluador');
    const isPostulante = roleNames.includes('postulante');
    const items: { key: string; label: string; onClick: () => void }[] = [];
    items.push({ key: 'conv', label: 'Convocatorias', onClick: () => { setOpenNav(false); navigate('/convocatorias'); } });
    if (isAuthenticated) {
      items.push({ key: 'perfil', label: 'Mi cuenta', onClick: () => { setOpenNav(false); navigate('/perfil'); } });
      if (isPostulante) items.push({ key: 'postu', label: 'Mis postulaciones', onClick: () => { setOpenNav(false); navigate('/mis-postulaciones'); } });
      if (isEvaluador || isAdmin) items.push({ key: 'eval', label: 'Mis evaluaciones', onClick: () => { setOpenNav(false); navigate('/mis-evaluaciones'); } });
      if (isAdmin) items.push({ key: 'admin', label: 'Administración', onClick: () => { setOpenNav(false); navigate('/admin'); } });
    }
    return items;
  }, [user, isAuthenticated, navigate]);

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-600) 100%)',
        color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.15)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!onConvocatorias && MENU_BUTTON_ON_LEFT && (
            <button
              className="btn"
              aria-label="Abrir menú"
              title="Abrir menú de navegación"
              style={{ background: 'rgba(119, 84, 218, 0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.18)' }}
              onClick={() => setOpenNav(true)}
            >
              ≡
            </button>
          )}
          {/* Logo imagen */}
          <img
            src="/brand/logo-upm.png"
            alt="Uniputumayo"
            style={{ width: 36, height: 36, objectFit: 'contain' }}
            onError={(e:any)=>{ try { e.currentTarget.onerror = null; e.currentTarget.src='/brand/logo-upm.jpg'; } catch(_) {} }}
          />
          <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>Sistema de gestión Uniputumayo</div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!onConvocatorias && !MENU_BUTTON_ON_LEFT && (
            <button
              className="btn"
              aria-label="Abrir menú"
              title="Abrir menú de navegación"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'rgba(255,255,255,0.18)' }}
              onClick={() => setOpenNav(true)}
            >
              ≡
            </button>
          )}
          {onConvocatorias && (
            isAuthenticated ? (
              <button
                className="btn"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'transparent' }}
                onClick={() => navigate('/perfil')}
              >Mi cuenta</button>
            ) : (
              <button
                className="btn"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'transparent' }}
                onClick={() => navigate('/')}
              >Regresar al inicio</button>
            )
          )}
          {!isAuthenticated ? (
            (showAuthButton && !onHome) ? (
              <button className="btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'transparent' }} onClick={() => {
                if (onOpenAuth) { onOpenAuth(); }
                else {
                  try { sessionStorage.setItem('auth_next', location.pathname + (location.search || '')); } catch {}
                  setAuthTab('login');
                  setAuthOpen(true);
                }
              }}>Ingresar</button>
            ) : null
          ) : (
            <>
              <button className="btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'transparent' }} onClick={logout}>Cerrar sesión</button>
            </>
          )}
        </nav>
      </div>
      {/* Panel de convocatorias sigue disponible si quieres acceso directo desde otros contextos */}
      <ConvocatoriasPanel open={openConv} onClose={() => setOpenConv(false)} />
      {/* Menú de navegación */}
      <SideNav open={openNav} onClose={() => setOpenNav(false)} items={navItems} side={MENU_BUTTON_ON_LEFT ? 'left' : 'right'} />

      {/* Modal de autenticación reutilizable fuera del Home */}
      <Modal open={authOpen} onClose={() => setAuthOpen(false)}>
        <div className="modal-header" style={{ position: 'relative' }}>
          <img src="/brand/letrero-upm.jpg" alt="letrero" className="auth-modal-logo" style={{ margin: '0 auto' }} />
          <button className="btn-ghost" onClick={() => setAuthOpen(false)} aria-label="Cerrar modal" title="Cerrar" style={{ position: 'absolute', right: 8, top: 8 }}>✕</button>
        </div>
        <div className="modal-body">
          {authTab === 'login' ? (
            <>
              <LoginForm onSuccess={() => {
                setAuthOpen(false);
                let dest: string | null = null;
                try { const stored = sessionStorage.getItem('auth_next'); if (stored) { dest = stored; sessionStorage.removeItem('auth_next'); } } catch {}
                if (!dest) {
                  const roles = (user?.roles || []).map((r: any) => String(r?.nombre_rol ?? r).toLowerCase());
                  const isAdmin = roles.includes('admin');
                  const isEvaluador = roles.includes('evaluador');
                  const isPostulante = roles.includes('postulante');
                  const effectiveRole = isAdmin ? 'admin' : (isEvaluador ? 'evaluador' : (isPostulante ? 'postulante' : 'none'));
                  dest = effectiveRole === 'admin' ? '/admin' : effectiveRole === 'evaluador' ? '/mis-evaluaciones' : effectiveRole === 'postulante' ? '/mis-postulaciones' : '/perfil';
                }
                navigate(dest);
              }} />
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <a className="link" href="#" onClick={(e)=>{ e.preventDefault(); setAuthTab('register'); }}>¿No tienes cuenta? Regístrate</a>
              </div>
            </>
          ) : (
            <>
              <RegisterForm onSuccess={() => { setAuthTab('login'); }} />
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <a className="link" href="#" onClick={(e)=>{ e.preventDefault(); setAuthTab('login'); }}>¿Ya tienes cuenta? Inicia sesión</a>
              </div>
            </>
          )}
        </div>
      </Modal>
    </header>
  );
}
