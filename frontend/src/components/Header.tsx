import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConvocatoriasPanel from './ConvocatoriasPanel';
import SideNav from './SideNav';

export default function Header({ onOpenAuth, showAuthButton = true }: { onOpenAuth?: () => void; showAuthButton?: boolean }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';
  const onProfile = location.pathname === '/perfil';
  const onConvocatorias = location.pathname === '/convocatorias';
  const [openConv, setOpenConv] = useState(false);
  const [openNav, setOpenNav] = useState(false);
  // Cambia este valor a 'left' si prefieres el botón del menú a la izquierda
  let MENU_BUTTON_SIDE: 'left' | 'right' = 'right';

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
          {MENU_BUTTON_SIDE === 'left' && (
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
          {MENU_BUTTON_SIDE === 'right' && (
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
            <button className="btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'transparent' }} onClick={() => navigate('/')}>← Regresar al inicio</button>
          )}
          {!isAuthenticated ? (
            (showAuthButton && !onHome) ? (
              <button className="btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'transparent' }} onClick={() => {
                if (onOpenAuth) { onOpenAuth(); }
                else {
                  const next = encodeURIComponent(location.pathname + (location.search || ''));
                  navigate(`/?auth=login&next=${next}`);
                }
              }}>Ingresar</button>
            ) : null
          ) : (
            <>
              <button className="btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', background: 'transparent' }} onClick={logout}>Salir</button>
            </>
          )}
        </nav>
      </div>
      {/* Panel de convocatorias sigue disponible si quieres acceso directo desde otros contextos */}
      <ConvocatoriasPanel open={openConv} onClose={() => setOpenConv(false)} />
      {/* Menú de navegación (hamburger) */}
      <SideNav open={openNav} onClose={() => setOpenNav(false)} items={navItems} />
    </header>
  );
}
