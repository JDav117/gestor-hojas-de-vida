import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

type Convocatoria = {
  id: number;
  nombre: string;
  fecha_apertura: string | Date;
  fecha_cierre: string | Date;
  estado: string;
};

export default function ConvocatoriasPage() {
  const [items, setItems] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const { user, isAuthenticated } = useAuth();
  const roleNames = (user?.roles || []).map((r: any) => String(r?.nombre_rol ?? r).toLowerCase());
  const isAdmin = roleNames.includes('admin');
  const isEvaluador = roleNames.includes('evaluador');
  const isPostulante = roleNames.includes('postulante');
  const effectiveRole: 'admin' | 'evaluador' | 'postulante' | 'none' = isAdmin ? 'admin' : (isEvaluador ? 'evaluador' : (isPostulante ? 'postulante' : 'none'));
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/convocatorias');
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || 'No se pudieron cargar las convocatorias');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location.key]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(x => x.nombre?.toLowerCase().includes(term) || String(x.id).includes(term) || x.estado?.toLowerCase().includes(term));
  }, [items, q]);

  function fmt(d: string | Date) {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString();
    } catch {
      return String(d);
    }
  }

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, width: '100%', maxWidth: 960, margin: '0 auto', padding: 16 }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Convocatorias</h2>
            <div className="input-group" style={{ maxWidth: 360 }}>
              <span className="input-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <input className="input" placeholder="Buscar por nombre, ID o estado" value={q} onChange={(e)=> setQ(e.target.value)} />
            </div>
          </div>
        </div>

        {loading && <div className="muted">Cargando…</div>}
        {error && <div className="text-danger">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="muted">No hay convocatorias para mostrar.</div>
        )}

        <div className="grid grid-2" style={{ gap: 12 }}>
          {filtered.map((c) => (
            <div key={c.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                  <div className="text-muted">ID: {c.id} • Estado: {c.estado}</div>
                  <div className="text-muted">Apertura: {fmt(c.fecha_apertura)} • Cierre: {fmt(c.fecha_cierre)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {effectiveRole === 'admin' && (
                    <Link className="btn" to={`/admin?convocatoria=${c.id}`}>Gestionar</Link>
                  )}
                  {effectiveRole === 'evaluador' && (
                    <Link className="btn" to={`/mis-evaluaciones?convocatoria=${c.id}`}>Ver asignadas</Link>
                  )}
                  {effectiveRole === 'postulante' && (
                    <Link className="btn" to={`/mis-postulaciones?convocatoria=${c.id}`}>Postular</Link>
                  )}
                  {!isAuthenticated && (
                    <span className="text-muted">Inicia sesión para postular</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
