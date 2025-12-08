import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import api from '../api/client';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Postulacion {
  id: number;
  estado: string;
  fecha_postulacion: string;
  submitted_at?: string;
  puntaje_documental?: number;
  puntaje_tecnico?: number;
  observaciones?: string;
  convocatoria: {
    id: number;
    titulo: string;
    descripcion: string;
    estado: string;
  };
  programa_academico?: {
    id: number;
    nombre_programa: string;
  };
  user?: {
    id: number;
    nombre_completo: string;
    email: string;
  };
}

function getEstadoBadge(estado: string) {
  const styles: Record<string, { bg: string; color: string; text: string }> = {
    borrador: { bg: '#f1f5f9', color: '#475569', text: 'Borrador' },
    presentada: { bg: '#dbeafe', color: '#1e40af', text: 'Presentada' },
    en_evaluacion: { bg: '#fef3c7', color: '#92400e', text: 'En evaluación' },
    evaluada: { bg: '#f0fdf4', color: '#166534', text: 'Evaluada' },
    aceptada: { bg: '#dcfce7', color: '#166534', text: 'Aceptada' },
    rechazada: { bg: '#fee2e2', color: '#991b1b', text: 'Rechazada' }
  };
  
  const style = styles[estado] || styles.borrador;
  
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: 12,
      fontSize: '0.75rem',
      fontWeight: 600,
      background: style.bg,
      color: style.color
    }}>
      {style.text}
    </span>
  );
}

export default function MisEvaluaciones() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAsignaciones();
  }, []);

  async function loadAsignaciones() {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get<Postulacion[]>('/asignaciones/me');
      setPostulaciones(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  }

  function handleEvaluar(postulacionId: number) {
    navigate(`/evaluar/${postulacionId}`);
  }

  if (loading) {
    return (
      <div className="container-center" style={{ flexDirection: 'column' }}>
        <Header />
        <main className="main-content">
          <Loader />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main className="main-content" style={{ maxWidth: 1200 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            <Icon name="assignment" size="lg" style={{ marginRight: 8, color: '#3b82f6' }} />
            Mis Asignaciones para Evaluar
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Postulaciones asignadas para tu evaluación
          </p>
        </div>

        {error ? (
          <div className="card" style={{ padding: 20, textAlign: 'center', background: '#fef2f2', borderColor: '#fecaca' }}>
            <Icon name="error" size="xl" style={{ color: '#dc2626' }} />
            <p style={{ marginTop: 12, color: '#dc2626', fontWeight: 600 }}>{error}</p>
          </div>
        ) : postulaciones.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <Icon name="inbox" size="xl" style={{ color: '#94a3b8' }} />
            <h3 style={{ marginTop: 16, fontSize: '1.125rem', color: '#64748b' }}>
              No tienes postulaciones asignadas
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: 8 }}>
              Cuando un administrador te asigne postulaciones para evaluar, aparecerán aquí
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {postulaciones.map((post) => (
              <div key={post.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        {post.convocatoria?.titulo || 'Convocatoria sin título'}
                      </h3>
                      {getEstadoBadge(post.estado)}
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 12 }}>
                      {post.convocatoria?.descripcion}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>Postulante</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                          {post.user?.nombre_completo || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                          {post.user?.email}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>Programa</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                          {post.programa_academico?.nombre_programa || 'No especificado'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>Fecha de postulación</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                          {new Date(post.fecha_postulacion).toLocaleDateString('es-CO', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </div>
                      </div>

                      {post.puntaje_documental !== undefined && post.puntaje_documental > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>Puntaje asignado</div>
                          <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#10b981' }}>
                            {post.puntaje_documental}
                          </div>
                        </div>
                      )}
                    </div>

                    {post.observaciones && (
                      <div style={{ 
                        marginTop: 12,
                        padding: 10,
                        background: '#fef3c7',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                        color: '#78350f'
                      }}>
                        <strong>Observaciones:</strong> {post.observaciones}
                      </div>
                    )}
                  </div>

                  <div style={{ marginLeft: 16 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEvaluar(post.id)}
                      style={{ minWidth: 140, fontWeight: 600 }}
                    >
                      <Icon name="rate_review" size="sm" style={{ marginRight: 4 }} />
                      {post.estado === 'evaluada' || post.puntaje_documental ? 'Ver evaluación' : 'Evaluar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
