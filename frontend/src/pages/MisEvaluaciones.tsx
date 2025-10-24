import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api/client';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

type Evaluacion = {
  id: number;
  postulacion_id: number;
  evaluador_id: number;
  fecha: string;
  puntaje_total: number;
};

export default function MisEvaluaciones() {
  const { user } = useAuth();
  const roleNames = (user?.roles || []).map((r: any) => String(r?.nombre_rol ?? r).toLowerCase());
  const isEvaluador = roleNames.includes('evaluador') || roleNames.includes('admin');
  const [items, setItems] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postulacionConvMap, setPostulacionConvMap] = useState<Record<number, number>>({});
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const targetConv = params.get('convocatoria');
  const targetConvId = targetConv ? Number(targetConv) : undefined;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: evals }, { data: posts }] = await Promise.all([
          api.get<Evaluacion[]>('/evaluaciones'),
          api.get<any[]>('/postulaciones'),
        ]);
        setItems(evals);
        const map: Record<number, number> = {};
        if (Array.isArray(posts)) {
          for (const p of posts) {
            if (p && typeof p.id === 'number' && typeof p.convocatoria_id === 'number') {
              map[p.id] = p.convocatoria_id;
            }
          }
        }
        setPostulacionConvMap(map);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'No se pudo cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!targetConvId) return items;
    return items.filter(ev => postulacionConvMap[ev.postulacion_id] === targetConvId);
  }, [items, postulacionConvMap, targetConvId]);

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: 16 }}>
        <h2>Mis evaluaciones</h2>
        {targetConvId ? (
          <div className="card" style={{ padding: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>Filtrando por convocatoria ID {targetConvId}</div>
            <Link className="btn" to="/mis-evaluaciones">Quitar filtro</Link>
          </div>
        ) : null}
        {!isEvaluador && (
          <div className="muted" style={{ marginBottom: 12 }}>Tu rol no incluye evaluaciones.</div>
        )}
        {loading ? <Loader /> : error ? (
          <div className="text-danger">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="muted">No hay evaluaciones para mostrar.</div>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Postulación</th>
                  <th>Puntaje</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.postulacion_id}</td>
                    <td>{p.puntaje_total}</td>
                    <td>{new Date(p.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
