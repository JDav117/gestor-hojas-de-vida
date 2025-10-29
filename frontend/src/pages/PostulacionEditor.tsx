import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
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
      const { data } = await api.patch<Postulacion>(`/postulaciones/${postulacion.id}`, { programa_id: programaId || null });
      setPostulacion(data);
      show('Cambios guardados', 'success');
    } catch (e: any) {
      show(e?.response?.data?.message || 'No se pudo guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleEnviar() {
    if (!postulacion) return;
    if (!programaId) {
      show('Debes seleccionar un programa para enviar', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post<Postulacion>(`/postulaciones/${postulacion.id}/submit`);
      setPostulacion(data);
      show('Postulación enviada correctamente', 'success');
    } catch (e: any) {
      show(e?.response?.data?.message || 'No se pudo enviar la postulación', 'error');
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
          <div className="card" style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div className="muted">Convocatoria</div>
              <div>#{postulacion.convocatoria_id}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="programa" className="muted">Programa académico</label>
              <select
                id="programa"
                className="input"
                disabled={!canEdit || saving}
                value={programaId === '' ? '' : String(programaId)}
                onChange={(e) => setProgramaId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecciona un programa</option>
                {programas.map(pg => (
                  <option key={pg.id} value={pg.id}>{pg.nombre_programa}</option>
                ))}
              </select>
              {selectedPrograma ? (
                <div className="muted" style={{ marginTop: 4 }}>Seleccionado: {selectedPrograma.nombre_programa}</div>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {canEdit ? (
                <>
                  <button className="btn" disabled={saving} onClick={handleGuardar}>Guardar</button>
                  <button className="btn btn-primary" disabled={saving} onClick={handleEnviar}>Enviar</button>
                </>
              ) : (
                <span className="badge">Estado: {postulacion.estado}</span>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
