import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface ItemBaremo {
  id: number;
  item_evaluacion_id: number;
  puntaje_maximo: number;
  nombre_item: string;
  descripcion: string;
}

interface PuntajeItem {
  item_evaluacion_id: number;
  puntaje: number;
}

export default function EvaluarPostulacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postulacion, setPostulacion] = useState<any>(null);
  const [baremo, setBaremo] = useState<ItemBaremo[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [puntajes, setPuntajes] = useState<Record<number, number>>({});
  const [observaciones, setObservaciones] = useState('');
  const [evaluacionExistente, setEvaluacionExistente] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      show('ID de postulación no válido', 'error');
      navigate('/evaluador');
      return;
    }

    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);

      // Cargar postulación
      const postRes = await api.get(`/postulaciones/${id}`);
      setPostulacion(postRes.data);

      // Cargar baremo de la convocatoria
      const baremoRes = await api.get(`/baremo-convocatoria?convocatoria_id=${postRes.data.convocatoria.id}`);
      setBaremo(baremoRes.data);

      // Cargar documentos
      const docsRes = await api.get(`/documentos/postulacion/${id}`);
      setDocumentos(docsRes.data);

      // Cargar evaluación existente si hay
      try {
        const evalRes = await api.get(`/evaluaciones?postulacion_id=${id}`);
        if (evalRes.data && evalRes.data.length > 0) {
          const evaluacion = evalRes.data[0];
          setEvaluacionExistente(evaluacion);
          
          // Cargar puntajes detallados si existen
          if (evaluacion.detalles_puntajes) {
            const puntajesObj: Record<number, number> = {};
            evaluacion.detalles_puntajes.forEach((item: PuntajeItem) => {
              puntajesObj[item.item_evaluacion_id] = item.puntaje;
            });
            setPuntajes(puntajesObj);
          }
          
          if (evaluacion.observaciones) {
            setObservaciones(evaluacion.observaciones);
          }
        }
      } catch (err) {
        // No hay evaluación previa, continuar normalmente
      }

    } catch (e: any) {
      show(e?.response?.data?.message || 'Error al cargar datos', 'error');
      navigate('/evaluador');
    } finally {
      setLoading(false);
    }
  }

  function handlePuntajeChange(itemEvaluacionId: number, valor: string) {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) {
      setPuntajes(prev => ({ ...prev, [itemEvaluacionId]: 0 }));
      return;
    }

    const itemBaremo = baremo.find(b => b.item_evaluacion_id === itemEvaluacionId);
    if (itemBaremo && num > itemBaremo.puntaje_maximo) {
      show(`El puntaje no puede exceder ${itemBaremo.puntaje_maximo}`, 'error');
      setPuntajes(prev => ({ ...prev, [itemEvaluacionId]: itemBaremo.puntaje_maximo }));
      return;
    }

    setPuntajes(prev => ({ ...prev, [itemEvaluacionId]: num }));
  }

  const puntajeTotal = useMemo(() => {
    return Object.values(puntajes).reduce((sum, p) => sum + p, 0);
  }, [puntajes]);

  const puntajeMaximoTotal = useMemo(() => {
    return baremo.reduce((sum, item) => sum + item.puntaje_maximo, 0);
  }, [baremo]);

  const todosItemsCalificados = useMemo(() => {
    return baremo.every(item => 
      puntajes[item.item_evaluacion_id] !== undefined && 
      puntajes[item.item_evaluacion_id] >= 0
    );
  }, [baremo, puntajes]);

  async function handleGuardar() {
    if (!todosItemsCalificados) {
      show('Debes calificar todos los ítems del baremo', 'error');
      return;
    }

    try {
      setSaving(true);

      const detallesPuntajes = baremo.map(item => ({
        item_evaluacion_id: item.item_evaluacion_id,
        nombre_item: item.nombre_item,
        puntaje: puntajes[item.item_evaluacion_id] || 0,
        puntaje_maximo: item.puntaje_maximo
      }));

      const payload = {
        postulacion_id: Number(id),
        evaluador_id: user?.id,
        puntaje_total: puntajeTotal,
        observaciones,
        detalles_puntajes: detallesPuntajes,
        fecha: new Date().toISOString()
      };

      if (evaluacionExistente) {
        await api.patch(`/evaluaciones/${evaluacionExistente.id}`, payload);
        show('Evaluación actualizada correctamente', 'success');
      } else {
        await api.post('/evaluaciones', payload);
        show('Evaluación guardada correctamente', 'success');
      }

      // Recargar datos
      await loadData();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      show(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al guardar evaluación'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleEnviarEvaluacion() {
    if (!todosItemsCalificados) {
      show('Debes calificar todos los ítems del baremo', 'error');
      return;
    }

    if (!observaciones.trim()) {
      if (!confirm('No has agregado observaciones. ¿Deseas continuar?')) {
        return;
      }
    }

    try {
      setSaving(true);

      const detallesPuntajes = baremo.map(item => ({
        item_evaluacion_id: item.item_evaluacion_id,
        nombre_item: item.nombre_item,
        puntaje: puntajes[item.item_evaluacion_id] || 0,
        puntaje_maximo: item.puntaje_maximo
      }));

      const payload = {
        postulacion_id: Number(id),
        evaluador_id: user?.id,
        puntaje_total: puntajeTotal,
        observaciones,
        detalles_puntajes: detallesPuntajes,
        fecha: new Date().toISOString(),
        finalizada: true
      };

      if (evaluacionExistente) {
        await api.patch(`/evaluaciones/${evaluacionExistente.id}`, payload);
      } else {
        await api.post('/evaluaciones', payload);
      }

      // Actualizar estado de la postulación a 'evaluada'
      await api.patch(`/postulaciones/${id}`, {
        estado: 'evaluada',
        puntaje_documental: puntajeTotal,
        observaciones
      });

      show('Evaluación enviada correctamente', 'success');
      setTimeout(() => navigate('/evaluador'), 1500);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      show(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al enviar evaluación'), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container-center" style={{ flexDirection: 'column' }}>
        <Header />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Icon name="hourglass_empty" size="xl" style={{ color: '#3b82f6' }} />
            <p style={{ marginTop: 16, color: '#64748b' }}>Cargando datos de la postulación...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!postulacion) {
    return (
      <div className="container-center" style={{ flexDirection: 'column' }}>
        <Header />
        <main className="main-content">
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <Icon name="error" size="xl" style={{ color: '#ef4444' }} />
            <h2 style={{ marginTop: 16 }}>Postulación no encontrada</h2>
            <button className="btn btn-primary" onClick={() => navigate('/evaluador')} style={{ marginTop: 16 }}>
              Volver
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canEdit = postulacion.estado === 'presentada' || postulacion.estado === 'en_evaluacion';
  const yaEvaluada = postulacion.estado === 'evaluada' || postulacion.estado === 'aceptada' || postulacion.estado === 'rechazada';

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main className="main-content" style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 20 }}>
          <button className="btn" onClick={() => navigate('/evaluador')} style={{ marginBottom: 16 }}>
            <Icon name="arrow_back" size="sm" style={{ marginRight: 4 }} />
            Volver a mis asignaciones
          </button>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            <Icon name="rate_review" size="lg" style={{ marginRight: 8, color: '#3b82f6' }} />
            Evaluar Postulación
          </h1>

          {yaEvaluada && (
            <div style={{ 
              padding: 12, 
              background: '#f0fdf4', 
              border: '2px solid #10b981',
              borderRadius: 8,
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Icon name="check_circle" size="md" style={{ color: '#10b981' }} />
              Esta postulación ya ha sido evaluada - Estado: {postulacion.estado}
            </div>
          )}
        </div>

        {/* Información del postulante */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            <Icon name="person" size="md" style={{ marginRight: 6, color: '#3b82f6' }} />
            Información del Postulante
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 4 }}>Nombre completo</div>
              <div style={{ fontWeight: 600 }}>{postulacion.user?.nombre_completo || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 4 }}>Email</div>
              <div style={{ fontWeight: 600 }}>{postulacion.user?.email || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 4 }}>Programa</div>
              <div style={{ fontWeight: 600 }}>{postulacion.programa_academico?.nombre_programa || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 4 }}>Fecha de postulación</div>
              <div style={{ fontWeight: 600 }}>
                {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-CO', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Convocatoria */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            <Icon name="campaign" size="md" style={{ marginRight: 6, color: '#f59e0b' }} />
            Convocatoria: {postulacion.convocatoria?.titulo}
          </h3>

          <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
            {postulacion.convocatoria?.descripcion}
          </div>

          {postulacion.convocatoria?.min_puntaje_aprobacion_documental > 0 && (
            <div style={{ 
              marginTop: 12,
              padding: 10,
              background: '#fef3c7',
              borderRadius: 6,
              fontSize: '0.875rem',
              color: '#92400e'
            }}>
              <Icon name="warning" size="sm" style={{ marginRight: 6, color: '#f59e0b' }} />
              <strong>Puntaje mínimo de aprobación:</strong> {postulacion.convocatoria.min_puntaje_aprobacion_documental}
            </div>
          )}
        </div>

        {/* Documentos adjuntos */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            <Icon name="folder_open" size="md" style={{ marginRight: 6, color: '#8b5cf6' }} />
            Documentos Adjuntos ({documentos.length})
          </h3>

          {documentos.length === 0 ? (
            <div style={{ 
              padding: 16,
              background: '#fef2f2',
              borderRadius: 8,
              textAlign: 'center',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              <Icon name="warning" size="md" style={{ marginBottom: 8 }} />
              <div>El postulante no ha adjuntado documentos</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>
                      {doc.nombre_documento}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {doc.nombre_archivo} • {new Date(doc.fecha_carga).toLocaleDateString('es-CO')}
                    </div>
                  </div>
                  <a
                    href={`${import.meta.env.VITE_API_URL}${doc.url_archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8125rem',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: 6,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Icon name="visibility" size="sm" />
                    Ver
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario de evaluación */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            <Icon name="checklist" size="md" style={{ marginRight: 6, color: '#10b981' }} />
            Calificación por Ítems del Baremo
          </h3>

          {baremo.length === 0 ? (
            <div style={{ 
              padding: 16,
              background: '#fef2f2',
              borderRadius: 8,
              textAlign: 'center',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              <Icon name="error" size="md" style={{ marginBottom: 8 }} />
              <div>No hay baremo configurado para esta convocatoria</div>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              {baremo.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: 16,
                    background: '#f8fafc',
                    borderRadius: 8,
                    marginBottom: 12,
                    border: puntajes[item.item_evaluacion_id] !== undefined ? '2px solid #10b981' : '2px solid #e2e8f0'
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 4, color: '#1e293b' }}>
                      {idx + 1}. {item.nombre_item}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {item.descripcion}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.8125rem', 
                        fontWeight: 600, 
                        marginBottom: 6,
                        color: '#1e293b'
                      }}>
                        Puntaje asignado (máx. {item.puntaje_maximo})
                      </label>
                      <input
                        type="number"
                        className="input"
                        disabled={!canEdit || saving}
                        min="0"
                        max={item.puntaje_maximo}
                        step="0.01"
                        value={puntajes[item.item_evaluacion_id] ?? ''}
                        onChange={(e) => handlePuntajeChange(item.item_evaluacion_id, e.target.value)}
                        placeholder="0.00"
                        style={{ 
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>

                    {puntajes[item.item_evaluacion_id] !== undefined && (
                      <div style={{ 
                        padding: '8px 12px',
                        background: '#f0fdf4',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                        color: '#166534',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}>
                        {puntajes[item.item_evaluacion_id]} / {item.puntaje_maximo}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Puntaje total */}
              <div style={{ 
                padding: 16,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: 8,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  <Icon name="workspace_premium" size="md" style={{ marginRight: 8 }} />
                  Puntaje Total
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                  {puntajeTotal.toFixed(2)} / {puntajeMaximoTotal}
                </div>
              </div>

              {postulacion.convocatoria?.min_puntaje_aprobacion_documental > 0 && (
                <div style={{ 
                  marginTop: 12,
                  padding: 12,
                  background: puntajeTotal >= postulacion.convocatoria.min_puntaje_aprobacion_documental 
                    ? '#f0fdf4' 
                    : '#fef2f2',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  color: puntajeTotal >= postulacion.convocatoria.min_puntaje_aprobacion_documental 
                    ? '#166534' 
                    : '#dc2626',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {puntajeTotal >= postulacion.convocatoria.min_puntaje_aprobacion_documental ? (
                    <>
                      <Icon name="check_circle" size="sm" style={{ marginRight: 6 }} />
                      Cumple con el puntaje mínimo requerido
                    </>
                  ) : (
                    <>
                      <Icon name="cancel" size="sm" style={{ marginRight: 6 }} />
                      No cumple con el puntaje mínimo requerido ({postulacion.convocatoria.min_puntaje_aprobacion_documental})
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            <Icon name="edit_note" size="md" style={{ marginRight: 6, color: '#64748b' }} />
            Observaciones
          </h3>

          <textarea
            className="input"
            disabled={!canEdit || saving}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escribe aquí tus comentarios y observaciones sobre la evaluación..."
            rows={6}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'vertical'
            }}
          />

          <div style={{ 
            marginTop: 8,
            fontSize: '0.8125rem',
            color: '#64748b'
          }}>
            Las observaciones serán visibles para el postulante
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 20 }}>
          {canEdit ? (
            <>
              <button 
                className="btn" 
                disabled={saving || !todosItemsCalificados} 
                onClick={handleGuardar}
                style={{ minWidth: 140 }}
                title={!todosItemsCalificados ? 'Debes calificar todos los ítems' : ''}
              >
                <Icon name="save" size="sm" style={{ marginRight: 4 }} />
                Guardar borrador
              </button>
              <button 
                className="btn btn-primary" 
                disabled={saving || !todosItemsCalificados} 
                onClick={handleEnviarEvaluacion}
                style={{ minWidth: 140, fontWeight: 600 }}
                title={!todosItemsCalificados ? 'Debes calificar todos los ítems' : ''}
              >
                {saving ? (
                  <><Icon name="hourglass_empty" size="sm" style={{ marginRight: 4 }} /> Enviando...</>
                ) : (
                  <><Icon name="send" size="sm" style={{ marginRight: 4 }} /> Enviar evaluación</>
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
              <Icon name="check_circle" size="sm" style={{ marginRight: 6 }} />
              Evaluación finalizada
            </div>
          )}
        </div>

        {/* Ayuda */}
        {canEdit && (
          <div style={{ 
            padding: 12,
            background: '#eff6ff',
            borderRadius: 8,
            fontSize: '0.8125rem',
            color: '#1e40af',
            lineHeight: 1.5
          }}>
            <Icon name="info" size="sm" style={{ marginRight: 6 }} />
            <strong>Recuerda:</strong> Puedes guardar tu progreso y volver más tarde. 
            Al enviar la evaluación, la postulación cambiará a estado "evaluada" y el postulante podrá ver su calificación.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
