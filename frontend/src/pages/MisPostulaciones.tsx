import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import api from '../api/client';
import Loader from '../components/Loader';
import { Link, useLocation } from 'react-router-dom';

type Postulacion = {
  id: number;
  postulante_id: number;
  convocatoria_id: number;
  programa_id: number | null;
  fecha_postulacion: string;
  estado: string;
  disponibilidad_horaria?: string | null;
  puntaje_documental?: number;
  puntaje_tecnico?: number;
  puntaje_total?: number;
  observaciones?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  evaluated_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Convocatoria = {
  id: number;
  nombre: string;
};

type Programa = {
  id: number;
  nombre_programa: string;
};

export default function MisPostulaciones() {
  const [items, setItems] = useState<Postulacion[]>([]);
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const targetConv = params.get('convocatoria');
  const targetConvId = targetConv ? Number(targetConv) : undefined;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Si venimos con una convocatoria destino, intenta crear/recuperar borrador primero
        if (targetConvId) {
          try {
            await api.post(`/postulaciones/draft/${targetConvId}`);
          } catch (e) {
            // Ignorar si ya existe o si backend no soporta; continuamos a listar
          }
        }
        const [postRes, convRes, progRes] = await Promise.all([
          api.get<Postulacion[]>('/postulaciones'),
          api.get<Convocatoria[]>('/convocatorias'),
          api.get<Programa[]>('/programas-academicos')
        ]);
        setItems(postRes.data);
        setConvocatorias(convRes.data);
        setProgramas(progRes.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'No se pudo cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, [targetConvId]);

  const filtered = useMemo(() => {
    if (!targetConvId) return items;
    return items.filter(it => it.convocatoria_id === targetConvId);
  }, [items, targetConvId]);

  const getNombreConvocatoria = (id: number) => {
    return convocatorias.find(c => c.id === id)?.nombre || `Convocatoria #${id}`;
  };

  const getNombrePrograma = (id: number | null) => {
    if (!id) return 'No seleccionado';
    return programas.find(p => p.id === id)?.nombre_programa || `Programa #${id}`;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { label: string; class: string; icon: string }> = {
      'borrador': { label: 'Borrador', class: 'warning', icon: 'edit' },
      'enviada': { label: 'Enviada', class: 'info', icon: 'send' },
      'en_revision': { label: 'En revisión', class: 'info', icon: 'search' },
      'aprobada': { label: 'Aprobada', class: 'success', icon: 'check_circle' },
      'rechazada': { label: 'Rechazada', class: 'danger', icon: 'cancel' },
      'preseleccionada': { label: 'Preseleccionada', class: 'success', icon: 'star' }
    };
    return badges[estado.toLowerCase()] || { label: estado, class: 'muted', icon: 'description' };
  };

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: 16 }}>
        <h2>Mis postulaciones</h2>
        {targetConvId ? (
          <div className="card" style={{ padding: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>Filtrando por convocatoria ID {targetConvId}</div>
            <Link className="btn" to="/mis-postulaciones">Quitar filtro</Link>
          </div>
        ) : null}
        {loading ? <Loader /> : error ? (
          <div className="text-danger">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <Icon name="description" size="xl" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: 16 }} />
            <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>No tienes postulaciones aún</div>
            <div className="muted" style={{ marginBottom: 16 }}>Explora las convocatorias disponibles y postula a las que te interesen</div>
            <Link to="/convocatorias" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="search" size="sm" />
              Ver convocatorias
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filtered.map((p) => {
              const badge = getEstadoBadge(p.estado);
              const isDraft = p.estado === 'borrador';
              const hasScores = (p.puntaje_documental || 0) > 0 || (p.puntaje_tecnico || 0) > 0;
              
              return (
                <div key={p.id} className="card" style={{ 
                  padding: 20,
                  border: isDraft ? '2px dashed #f59e0b' : '1px solid #e2e8f0'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                          {getNombreConvocatoria(p.convocatoria_id)}
                        </h3>
                        <span className={`badge ${badge.class}`} style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon name={badge.icon} size="sm" />
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>Postulación #{p.id}</div>
                    </div>
                    <Link 
                      className={`btn ${isDraft ? 'btn-primary' : ''}`}
                      to={`/postulaciones/${p.id}`}
                      style={{ fontWeight: 600 }}
                    >
                      {isDraft ? (
                        <><Icon name="edit" size="sm" style={{ marginRight: 4 }} /> Completar</>
                      ) : (
                        <><Icon name="visibility" size="sm" style={{ marginRight: 4 }} /> Ver detalles</>
                      )}
                    </Link>
                  </div>

                  {/* Información principal */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 16,
                    padding: 16,
                    background: '#f8fafc',
                    borderRadius: 8,
                    marginBottom: 16
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="school" size="sm" style={{ color: '#3b82f6' }} /> Programa
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{getNombrePrograma(p.programa_id)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="calendar_today" size="sm" style={{ color: '#10b981' }} /> Fecha postulación
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatDate(p.fecha_postulacion)}</div>
                    </div>
                    {p.submitted_at && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="check_circle" size="sm" style={{ color: '#10b981' }} /> Enviada
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatDate(p.submitted_at)}</div>
                      </div>
                    )}
                  </div>

                  {/* Timeline del proceso */}
                  {p.submitted_at && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: '#64748b' }}>
                        <Icon name="timeline" size="sm" style={{ marginRight: 6, color: '#64748b' }} />
                        Progreso de evaluación:
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: '0.8125rem' }}>
                        <div style={{ 
                          flex: 1, 
                          padding: 8, 
                          background: p.submitted_at ? '#dbeafe' : '#f1f5f9',
                          borderRadius: 6,
                          border: p.submitted_at ? '2px solid #3b82f6' : '1px solid #cbd5e1'
                        }}>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="send" size="sm" /> Enviada
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(p.submitted_at)}</div>
                        </div>
                        <div style={{ 
                          flex: 1, 
                          padding: 8, 
                          background: p.reviewed_at ? '#dbeafe' : '#f1f5f9',
                          borderRadius: 6,
                          border: p.reviewed_at ? '2px solid #3b82f6' : '1px solid #cbd5e1'
                        }}>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="search" size="sm" /> Revisada
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(p.reviewed_at)}</div>
                        </div>
                        <div style={{ 
                          flex: 1, 
                          padding: 8, 
                          background: p.evaluated_at ? '#dbeafe' : '#f1f5f9',
                          borderRadius: 6,
                          border: p.evaluated_at ? '2px solid #3b82f6' : '1px solid #cbd5e1'
                        }}>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="gps_fixed" size="sm" /> Evaluada
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(p.evaluated_at)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Puntajes */}
                  {hasScores && (
                    <div style={{ 
                      padding: 16, 
                      background: '#f0fdf4', 
                      borderRadius: 8,
                      border: '1px solid #22c55e',
                      marginBottom: 16
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: '#166534' }}>
                        <Icon name="emoji_events" size="sm" style={{ marginRight: 6, color: '#166534' }} />
                        Puntajes obtenidos:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: '0.875rem' }}>
                        <div>
                          <div style={{ color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                            <Icon name="description" size="sm" /> Documental
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>
                            {p.puntaje_documental || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                            <Icon name="gps_fixed" size="sm" /> Técnico
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>
                            {p.puntaje_tecnico || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                            <Icon name="workspace_premium" size="sm" /> Total
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>
                            {p.puntaje_total || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observaciones */}
                  {p.observaciones && (
                    <div style={{ 
                      padding: 12, 
                      background: '#fef3c7', 
                      borderRadius: 8,
                      border: '1px solid #fbbf24'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#92400e' }}>
                        <Icon name="edit_note" size="sm" style={{ marginRight: 6, color: '#92400e' }} />
                        Observaciones del evaluador:
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.5 }}>
                        {p.observaciones}
                      </div>
                    </div>
                  )}

                  {/* Alerta para borradores */}
                  {isDraft && (
                    <div style={{ 
                      marginTop: 16,
                      padding: 12, 
                      background: '#fef3c7', 
                      borderRadius: 8,
                      fontSize: '0.875rem',
                      color: '#92400e'
                    }}>
                      <Icon name="warning" size="sm" style={{ marginRight: 6, color: '#f59e0b' }} />
                      <strong>Acción requerida:</strong> Esta postulación está en borrador. 
                      Debes completar tu información y enviarla antes de la fecha de cierre.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
