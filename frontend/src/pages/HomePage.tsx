import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { getDefaultRouteForRole } from '../utils/roleHelpers';

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // Mostrar login o registro en el modal
  const [wordmarkLoaded, setWordmarkLoaded] = useState<boolean>(false);
  const [wordmarkSrc, setWordmarkSrc] = useState<string>('/brand/letrero-upm.png');
  const nav = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Abrir panel según query (?auth=login|register)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('auth');
    const next = params.get('next');
    if (mode === 'login' || mode === 'register') {
      setOpen(true);
      setTab(mode);
      if (next) {
        try { sessionStorage.setItem('auth_next', next); } catch {}
      }
      // Limpia el query param para una URL más prolija
      nav(location.pathname, { replace: true });
    }
  }, [location.search]);

  // Redirigir cuando el usuario se cargue después del login
  useEffect(() => {
    if (shouldRedirect && user) {
      setShouldRedirect(false);
      let dest: string | null = null;
      try { 
        const stored = sessionStorage.getItem('auth_next'); 
        if (stored) { 
          dest = stored; 
          sessionStorage.removeItem('auth_next'); 
        } 
      } catch {}
      
      if (!dest) {
        dest = getDefaultRouteForRole(user);
      }
      nav(dest);
    }
  }, [shouldRedirect, user, nav]);

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
  <Header onOpenAuth={() => setOpen(true)} showAuthButton={false} />
      {/* Centro: branding */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="brand-card" style={{ position: 'relative' }}>
          {/* Logo real con fallback a .jpg si .png no existe */}
          <img
            src="/brand/logo-upm.png"
            alt="Uniputumayo"
            className="brand-logo"
            style={{ objectFit: 'contain' }}
            onError={(e:any)=>{
              const img = e.currentTarget as HTMLImageElement;
              if (!img.dataset.triedJpg) {
                img.dataset.triedJpg = '1';
                img.src = '/brand/logo-upm.jpg';
              } else {
                img.style.display = 'none';
              }
            }}
          />
          {/* Si no hay imagen, mostramos fallback */}
          <noscript><div className="brand-logo">UPM</div></noscript>
          <h1>SISTEMA DE GESTIÓN UNIPUTUMAYO</h1>
          <p>Gestor de hojas de vida y convocatorias.</p>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>Ingresar</button>
        </div>
      </div>

      {/* Modal centrado para login/registro */}
      <Modal open={open} onClose={() => { setOpen(false); }}>
        <div className="modal-header" style={{ position: 'relative' }}>
          <img src="/brand/letrero-upm.jpg" alt="letrero" className="auth-modal-logo" style={{ margin: '0 auto' }} />
          <button className="btn-ghost" onClick={() => setOpen(false)} aria-label="Cerrar modal" title="Cerrar" style={{ position: 'absolute', right: 8, top: 8 }}>✕</button>
        </div>
        <div className="modal-body">
          {tab === 'login' ? (
            <>
              <LoginForm onSuccess={async () => { 
                setOpen(false);
                // Pequeña espera para que React actualice el contexto
                await new Promise(resolve => setTimeout(resolve, 100));
                // Activar la redirección - useEffect la manejará cuando user esté listo
                setShouldRedirect(true);
              }} />
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <a className="link" href="#" onClick={(e)=>{ e.preventDefault(); setTab('register'); }}>¿No tienes cuenta? Regístrate</a>
              </div>
            </>
          ) : (
            <>
              <RegisterForm onSuccess={() => { setTab('login'); }} />
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <a className="link" href="#" onClick={(e)=>{ e.preventDefault(); setTab('login'); }}>¿Ya tienes cuenta? Inicia sesión</a>
              </div>
            </>
          )}
        </div>
      </Modal>
      <Footer />
    </div>
  );
}
