import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import Icon from '../components/Icon';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

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
  convocatoria?: {
    id: number;
    nombre: string;
    descripcion?: string;
    fecha_cierre: string;
    cupos?: number;
    sede?: string;
    requisitos_documentales?: any;
    min_puntaje_aprobacion_documental?: number;
    min_puntaje_aprobacion_tecnica?: number;
  };
};

 type Programa = {
  id: number;
  nombre_programa: string;
};

export default function PostulacionEditor() {
  const { id } = useParams();
  const pid = id ? Number(id) : NaN;
  const { show } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postulacion, setPostulacion] = useState<Postulacion | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [programaId, setProgramaId] = useState<number | ''>('');

  const isDraft = postulacion?.estado === 'borrador';

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!pid || Number.isNaN(pid)) return;
      setLoading(true);
      setError(null);
      try {
        const [pRes, prRes] = await Promise.all([
          api.get<Postulacion>(`/postulaciones/${pid}`),
          api.get<Programa[]>(`/programas-academicos`),
        ]);
        if (!mounted) return;
        setPostulacion(pRes.data);
        setProgramas(prRes.data);
        setProgramaId(pRes.data.programa_id ?? '');
      } catch (e: any) {
        setError(e?.response?.data?.message || 'No se pudo cargar la postulación');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pid]);

  const selectedPrograma = useMemo(() => programas.find(p => p.id === programaId), [programaId, programas]);
  const isOwner = useMemo(() => !!(user && postulacion && user.id === postulacion.postulante_id), [user, postulacion]);
  const canEdit = isOwner && isDraft;

  async function handleGuardar() {
    if (!postulacion) return;
    setSaving(true);
    try {
      const payload: any = {};
      if (programaId !== postulacion.programa_id) {
        payload.programa_id = programaId || null;
      }
      const { data } = await api.patch<Postulacion>(`/postulaciones/${postulacion.id}`, payload);
      setPostulacion(data);
      show('Cambios guardados correctamente', 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (Array.isArray(msg)) {
        show(msg.join(', '), 'error');
      } else {
        show(msg || 'No se pudo guardar', 'error');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEnviar() {
    if (!postulacion) return;
    
    // Validar que el programa esté seleccionado y guardado
    if (!programaId) {
      show('Debes seleccionar un programa académico antes de enviar', 'error');
      return;
    }
    
    // Si el programa cambió, guardar primero
    if (programaId !== postulacion.programa_id) {
      show('Guardando programa seleccionado...', 'info');
      try {
        const { data } = await api.patch<Postulacion>(`/postulaciones/${postulacion.id}`, { programa_id: programaId || null });
        setPostulacion(data);
      } catch (e: any) {
        const msg = e?.response?.data?.message;
        show(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al guardar programa'), 'error');
        return;
      }
    }
    
    setSaving(true);
    try {
      const { data } = await api.post<Postulacion>(`/postulaciones/${postulacion.id}/submit`);
      setPostulacion(data);
      show('Postulación enviada correctamente', 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      show(Array.isArray(msg) ? msg.join(', ') : (msg || 'No se pudo enviar la postulación'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2>Postulación #{id}</h2>
          <Link to="/mis-postulaciones" className="btn">Volver</Link>
        </div>
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : !postulacion ? (
          <div className="muted">No encontrada</div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Info de la convocatoria */}
            {postulacion.convocatoria && (
              <div className="card" style={{ padding: 20, background: '#f8fafc', border: '2px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="campaign" size="sm" style={{ color: '#3b82f6' }} /> Convocatoria
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                      {postulacion.convocatoria.nombre}
                    </h3>
                  </div>
                  <span className={`badge ${isDraft ? 'warning' : 'success'}`}>
                    {isDraft ? (
                      <><Icon name="edit" size="sm" style={{ marginRight: 4 }} /> Borrador</>
                    ) : (
                      <><Icon name="check_circle" size="sm" style={{ marginRight: 4 }} /> Enviada</>
                    )}
                  </span>
                </div>
                
                {postulacion.convocatoria.descripcion && (
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 12 }}>
                    {postulacion.convocatoria.descripcion}
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.875rem' }}>
                  {postulacion.convocatoria.cupos && (
                    <div>
                      <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="group" size="sm" style={{ color: '#10b981' }} /> Cupos:
                      </span>
                      <strong>{postulacion.convocatoria.cupos}</strong>
                    </div>
                  )}
                  {postulacion.convocatoria.sede && (
                    <div>
                      <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="location_on" size="sm" style={{ color: '#ef4444' }} /> Sede:
                      </span>
                      <strong>{postulacion.convocatoria.sede}</strong>
                    </div>
                  )}
                  {postulacion.convocatoria.fecha_cierre && (
                    <div>
                      <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="event_busy" size="sm" style={{ color: '#dc2626' }} /> Cierre:
                      </span>
                      <strong style={{ color: '#dc2626' }}>
                        {new Date(postulacion.convocatoria.fecha_cierre).toLocaleDateString('es-CO', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Puntajes mínimos */}
                {((postulacion.convocatoria.min_puntaje_aprobacion_documental || 0) > 0 || 
                  (postulacion.convocatoria.min_puntaje_aprobacion_tecnica || 0) > 0) && (
                  <div style={{ 
                    marginTop: 12, 
                    padding: 12, 
                    background: '#fef3c7', 
                    borderRadius: 8,
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
                      <Icon name="warning" size="sm" style={{ marginRight: 6, color: '#f59e0b' }} />
                      Puntajes mínimos requeridos:
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: '#78350f' }}>
                      {(postulacion.convocatoria.min_puntaje_aprobacion_documental || 0) > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="description" size="sm" /> Documental: <strong>{postulacion.convocatoria.min_puntaje_aprobacion_documental}</strong>
                        </div>
                      )}
                      {(postulacion.convocatoria.min_puntaje_aprobacion_tecnica || 0) > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="gps_fixed" size="sm" /> Técnica: <strong>{postulacion.convocatoria.min_puntaje_aprobacion_tecnica}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Requisitos documentales */}
                {postulacion.convocatoria.requisitos_documentales && 
                 Array.isArray(postulacion.convocatoria.requisitos_documentales) &&
                 postulacion.convocatoria.requisitos_documentales.length > 0 && (
                  <div style={{ 
                    marginTop: 12, 
                    padding: 12, 
                    background: '#eff6ff', 
                    borderRadius: 8,
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>
                      <Icon name="folder_open" size="sm" style={{ marginRight: 6, color: '#1e40af' }} />
                      Documentos que debes presentar:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: '#1e40af' }}>
                      {postulacion.convocatoria.requisitos_documentales.map((doc: string, idx: number) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Formulario de postulación */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name={isDraft ? 'edit' : 'assignment'} size="md" />
                  {isDraft ? 'Completa tu postulación' : 'Información de tu postulación'}
                </span>
              </h3>

              <div style={{ marginBottom: 16 }}>
                <label htmlFor="programa" style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  marginBottom: 6,
                  color: '#1e293b'
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="school" size="sm" style={{ color: '#3b82f6' }} />
                    Programa académico al que postulas *
                  </span>
                </label>
                <select
                  id="programa"
                  className="input"
                  disabled={!canEdit || saving}
                  value={programaId === '' ? '' : String(programaId)}
                  onChange={(e) => setProgramaId(e.target.value ? Number(e.target.value) : '')}
                  style={{ 
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.875rem',
                    border: programaId ? '2px solid #10b981' : '2px solid #e2e8f0'
                  }}
                >
                  <option value="">-- Selecciona el programa --</option>
                  {programas.map(pg => (
                    <option key={pg.id} value={pg.id}>{pg.nombre_programa}</option>
                  ))}
                </select>
                {selectedPrograma && (
                  <div style={{ 
                    marginTop: 8, 
                    padding: 8, 
                    background: '#f0fdf4', 
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    color: '#166534'
                  }}>
                    <Icon name="check_circle" size="sm" style={{ marginRight: 4, color: '#10b981' }} />
                    Seleccionado: <strong>{selectedPrograma.nombre_programa}</strong>
                  </div>
                )}
                {!programaId && isDraft && (
                  <div style={{ marginTop: 6, fontSize: '0.8125rem', color: '#dc2626' }}>
                    * Debes seleccionar un programa antes de enviar tu postulación
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div style={{ 
                padding: 12, 
                background: '#f8fafc', 
                borderRadius: 8,
                marginBottom: 16,
                fontSize: '0.875rem'
              }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>📅 Fecha de postulación: </span>
                  <strong>
                    {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-CO', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </strong>
                </div>
                {postulacion.submitted_at && (
                  <div>
                    <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="send" size="sm" style={{ color: '#10b981' }} /> Enviada el:
                    </span>
                    <strong style={{ color: '#10b981' }}>
                      {new Date(postulacion.submitted_at).toLocaleDateString('es-CO', { 
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </strong>
                  </div>
                )}
              </div>

              {/* Puntajes (si ya fueron evaluados) */}
              {((postulacion.puntaje_documental || 0) > 0 || (postulacion.puntaje_tecnico || 0) > 0) && (
                <div style={{ 
                  padding: 16, 
                  background: '#f0fdf4', 
                  borderRadius: 8,
                  border: '1px solid #22c55e',
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12, color: '#166534' }}>
                    <Icon name="emoji_events" size="sm" style={{ marginRight: 6, color: '#166534' }} />
                    Puntajes de evaluación:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                        <Icon name="description" size="sm" /> Documental
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d' }}>
                        {postulacion.puntaje_documental || 0}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                        <Icon name="gps_fixed" size="sm" /> Técnico
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d' }}>
                        {postulacion.puntaje_tecnico || 0}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                        <Icon name="workspace_premium" size="sm" /> Total
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d' }}>
                        {postulacion.puntaje_total || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {postulacion.observaciones && (
                <div style={{ 
                  padding: 12, 
                  background: '#fef3c7', 
                  borderRadius: 8,
                  border: '1px solid #fbbf24',
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 6, color: '#92400e' }}>
                    <Icon name="edit_note" size="sm" style={{ marginRight: 6, color: '#92400e' }} />
                    Observaciones del evaluador:
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.5 }}>
                    {postulacion.observaciones}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                {canEdit ? (
                  <>
                    <button 
                      className="btn" 
                      disabled={saving} 
                      onClick={handleGuardar}
                      style={{ minWidth: 120 }}
                    >
                      <Icon name="save" size="sm" style={{ marginRight: 4 }} />
                      Guardar
                    </button>
                    <button 
                      className="btn btn-primary" 
                      disabled={saving || !programaId} 
                      onClick={handleEnviar}
                      style={{ minWidth: 120, fontWeight: 600 }}
                    >
                      {saving ? (
                        <><Icon name="hourglass_empty" size="sm" style={{ marginRight: 4 }} /> Enviando...</>
                      ) : (
                        <><Icon name="send" size="sm" style={{ marginRight: 4 }} /> Enviar postulación</>
                      )}
                    </button>
                  </>
                ) : (
                  <div style={{ 
                    flex: 1, 
                    padding: 12, 
                    background: '#f0fdf4', 
                    borderRadius: 8,
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#166534',
                    fontWeight: 600
                  }}>
                    ✅ Postulación enviada - Estado: {postulacion.estado}
                  </div>
                )}
              </div>

              {/* Ayuda para borrador */}
              {isDraft && (
                <div style={{ 
                  marginTop: 16,
                  padding: 12, 
                  background: '#eff6ff', 
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  color: '#1e40af',
                  lineHeight: 1.5
                }}>
                  <Icon name="info" size="sm" style={{ marginRight: 6, color: '#1e40af' }} />
                  <strong>Recuerda:</strong> Esta postulación está en borrador. Puedes guardar tus cambios y volver más tarde, 
                  pero debes enviarla antes de la fecha de cierre para que sea considerada en el proceso de selección.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
