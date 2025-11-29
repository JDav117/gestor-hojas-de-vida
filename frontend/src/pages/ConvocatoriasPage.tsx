import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type Convocatoria = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  fecha_apertura: string | Date;
  fecha_cierre: string | Date;
  estado: string;
  programa_academico_id?: number | null;
  cupos?: number | null;
  sede?: string | null;
  dedicacion?: string | null;
  tipo_vinculacion?: string | null;
  requisitos_documentales?: any;
  min_puntaje_aprobacion_documental?: number;
  min_puntaje_aprobacion_tecnica?: number;
  created_at?: string;
  updated_at?: string;
};

type Programa = {
  id: number;
  nombre_programa: string;
};

export default function ConvocatoriasPage() {
  const [items, setItems] = useState<Convocatoria[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState<number | ''>('');
  const [filtroSede, setFiltroSede] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const { user, isAuthenticated } = useAuth();
  const roleNames = (user?.roles || []).map((r: any) => String(r?.nombre_rol ?? r).toLowerCase());
  const isAdmin = roleNames.includes('admin');
  const isEvaluador = roleNames.includes('evaluador');
  const isPostulante = roleNames.includes('postulante');
  const effectiveRole: 'admin' | 'evaluador' | 'postulante' | 'none' = isAdmin ? 'admin' : (isEvaluador ? 'evaluador' : (isPostulante ? 'postulante' : 'none'));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [convsRes, progsRes] = await Promise.all([
          api.get('/convocatorias'),
          api.get('/programas-academicos')
        ]);
        if (!cancelled) {
          setItems(Array.isArray(convsRes.data) ? convsRes.data : []);
          setProgramas(Array.isArray(progsRes.data) ? progsRes.data : []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || 'No se pudieron cargar las convocatorias');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location.key]);

  const filtered = useMemo(() => {
    let result = items;
    
    // Filtro por búsqueda de texto
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(x => 
        x.nombre?.toLowerCase().includes(term) || 
        String(x.id).includes(term) || 
        x.estado?.toLowerCase().includes(term) ||
        x.sede?.toLowerCase().includes(term)
      );
    }
    
    // Filtro por programa
    if (filtroPrograma) {
      result = result.filter(x => x.programa_academico_id === filtroPrograma);
    }
    
    // Filtro por sede
    if (filtroSede) {
      result = result.filter(x => x.sede?.toLowerCase() === filtroSede.toLowerCase());
    }
    
    // Filtro por estado
    if (filtroEstado) {
      result = result.filter(x => x.estado?.toLowerCase() === filtroEstado.toLowerCase());
    }
    
    return result;
  }, [items, q, filtroPrograma, filtroSede, filtroEstado]);
  
  const getNombrePrograma = (id?: number | null) => {
    if (!id) return null;
    const prog = programas.find(p => p.id === id);
    return prog?.nombre_programa || null;
  };
  
  const sedes = useMemo(() => {
    const sedesSet = new Set(items.map(c => c.sede).filter(Boolean));
    return Array.from(sedesSet);
  }, [items]);

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
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <h2 style={{ margin: '0 0 16px 0' }}>Convocatorias</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div className="input-group">
              <span className="input-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <input className="input" placeholder="Buscar..." value={q} onChange={(e)=> setQ(e.target.value)} />
            </div>
            
            <select className="input" value={filtroPrograma} onChange={(e) => setFiltroPrograma(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Todos los programas</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre_programa}</option>)}
            </select>
            
            <select className="input" value={filtroSede} onChange={(e) => setFiltroSede(e.target.value)}>
              <option value="">Todas las sedes</option>
              {sedes.map(s => <option key={s} value={s || ''}>{s}</option>)}
            </select>
            
            <select className="input" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="publicada">Publicada</option>
              <option value="cerrada">Cerrada</option>
              <option value="borrador">Borrador</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          
          {(q || filtroPrograma || filtroSede || filtroEstado) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {q && <span className="badge">Búsqueda: {q} <button onClick={() => setQ('')} style={{ marginLeft: 4, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}>×</button></span>}
              {filtroPrograma && <span className="badge">Programa: {getNombrePrograma(filtroPrograma)} <button onClick={() => setFiltroPrograma('')} style={{ marginLeft: 4, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}>×</button></span>}
              {filtroSede && <span className="badge">Sede: {filtroSede} <button onClick={() => setFiltroSede('')} style={{ marginLeft: 4, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}>×</button></span>}
              {filtroEstado && <span className="badge">Estado: {filtroEstado} <button onClick={() => setFiltroEstado('')} style={{ marginLeft: 4, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}>×</button></span>}
            </div>
          )}
        </div>

        {loading && <div className="muted">Cargando…</div>}
        {error && <div className="text-danger">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="muted">No hay convocatorias para mostrar.</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: 20 }}>
          {filtered.map((c) => {
            const isVigente = c.estado === 'publicada';
            const isCerrada = c.estado === 'cerrada';
            const requisitos = Array.isArray(c.requisitos_documentales) 
              ? c.requisitos_documentales 
              : (typeof c.requisitos_documentales === 'string' ? c.requisitos_documentales.split(',').map(d => d.trim()) : []);
            
            return (
              <div key={c.id} className="card" style={{ 
                padding: 20, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 16,
                border: isVigente ? '2px solid #10b981' : '1px solid #e2e8f0',
                boxShadow: isVigente ? '0 4px 12px rgba(16, 185, 129, 0.15)' : undefined
              }}>
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{c.nombre}</h3>
                    <span className={`badge ${
                      isVigente ? 'success' : 
                      isCerrada ? 'muted' : 
                      c.estado === 'borrador' ? 'warning' : 'info'
                    }`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      {c.estado.toUpperCase()}
                    </span>
                  </div>
                  
                  {c.descripcion && (
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '8px 0', lineHeight: 1.5 }}>
                      {c.descripcion}
                    </p>
                  )}
                </div>

                {/* Información básica destacada */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 12,
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8
                }}>
                  {getNombrePrograma(c.programa_academico_id) && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="school" size="sm" style={{ color: '#3b82f6' }} /> Programa
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                        {getNombrePrograma(c.programa_academico_id)}
                      </div>
                    </div>
                  )}
                  
                  {c.cupos && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="group" size="sm" style={{ color: '#10b981' }} /> Cupos disponibles
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{c.cupos}</div>
                    </div>
                  )}
                  
                  {c.sede && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="location_on" size="sm" style={{ color: '#ef4444' }} /> Sede
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{c.sede}</div>
                    </div>
                  )}
                  
                  {c.dedicacion && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="schedule" size="sm" style={{ color: '#8b5cf6' }} /> Dedicación
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{c.dedicacion}</div>
                    </div>
                  )}
                  
                  {c.tipo_vinculacion && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="description" size="sm" style={{ color: '#f59e0b' }} /> Tipo de vinculación
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{c.tipo_vinculacion}</div>
                    </div>
                  )}
                </div>

                {/* Fechas importantes */}
                <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="event" size="sm" style={{ color: '#10b981' }} /> Apertura
                    </div>
                    <div style={{ fontWeight: 600 }}>{fmt(c.fecha_apertura)}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="event_busy" size="sm" style={{ color: '#dc2626' }} /> Cierre
                    </div>
                    <div style={{ fontWeight: 600, color: '#dc2626' }}>{fmt(c.fecha_cierre)}</div>
                  </div>
                </div>

                {/* Requisitos mínimos */}
                {((c.min_puntaje_aprobacion_documental || 0) > 0 || (c.min_puntaje_aprobacion_tecnica || 0) > 0) && (
                  <div style={{ 
                    padding: 12, 
                    background: '#fef3c7', 
                    borderRadius: 8,
                    border: '1px solid #fbbf24'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e', marginBottom: 6 }}>
                      <Icon name="warning" size="sm" style={{ color: '#f59e0b', marginRight: 4 }} />
                      Puntajes mínimos requeridos:
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem' }}>
                      {(c.min_puntaje_aprobacion_documental || 0) > 0 && (
                        <div>
                          <span style={{ color: '#78350f', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="description" size="sm" /> Documental:
                          </span>
                          <strong>{c.min_puntaje_aprobacion_documental}</strong>
                        </div>
                      )}
                      {(c.min_puntaje_aprobacion_tecnica || 0) > 0 && (
                        <div>
                          <span style={{ color: '#78350f', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="gps_fixed" size="sm" /> Técnica:
                          </span>
                          <strong>{c.min_puntaje_aprobacion_tecnica}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documentos requeridos */}
                {requisitos.length > 0 && (
                  <div style={{ 
                    padding: 12, 
                    background: '#eff6ff', 
                    borderRadius: 8,
                    border: '1px solid #3b82f6'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>
                      <Icon name="folder_open" size="sm" style={{ marginRight: 4 }} />
                      Documentos que debes presentar:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.8125rem', color: '#1e40af' }}>
                      {requisitos.map((doc: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: 2 }}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Acciones */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                  {effectiveRole === 'admin' && (
                    <Link className="btn" to={`/admin?convocatoria=${c.id}`}>Gestionar</Link>
                  )}
                  {effectiveRole === 'evaluador' && (
                    <Link className="btn" to={`/mis-evaluaciones?convocatoria=${c.id}`}>Ver asignadas</Link>
                  )}
                  {effectiveRole === 'postulante' && isVigente && (
                    <button className="btn btn-primary" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate(`/mis-postulaciones?convocatoria=${c.id}`)}>
                      <Icon name="send" size="sm" />
                      Postularme ahora
                    </button>
                  )}
                  {effectiveRole === 'postulante' && !isVigente && (
                    <button className="btn" disabled style={{ opacity: 0.5 }}>
                      {isCerrada ? 'Convocatoria cerrada' : 'No disponible'}
                    </button>
                  )}
                  {!isAuthenticated && isVigente && (
                    <button
                      className="btn btn-primary"
                      style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => {
                        const dest = `/mis-postulaciones?convocatoria=${c.id}`;
                        try { sessionStorage.setItem('auth_next', dest); } catch {}
                        const evt = new CustomEvent('open-auth-modal', { detail: { mode: 'login', next: dest } });
                        window.dispatchEvent(evt);
                      }}
                    >
                      <Icon name="send" size="sm" />
                      Postularme ahora
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
