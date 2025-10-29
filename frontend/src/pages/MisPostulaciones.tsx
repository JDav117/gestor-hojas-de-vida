import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api/client';
import Loader from '../components/Loader';
import { Link, useLocation } from 'react-router-dom';

type Postulacion = {
  id: number;
  postulante_id: number;
  convocatoria_id: number;
  programa_id: number;
  fecha_postulacion: string;
  estado: string;
  disponibilidad_horaria?: string | null;
};

export default function MisPostulaciones() {
  const [items, setItems] = useState<Postulacion[]>([]);
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
        const { data } = await api.get<Postulacion[]>('/postulaciones');
        setItems(data);
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
          <div className="muted">No hay postulaciones para mostrar.</div>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Convocatoria</th>
                  <th>Programa</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.convocatoria_id}</td>
                    <td>{p.programa_id}</td>
                    <td>{new Date(p.fecha_postulacion).toLocaleString()}</td>
                    <td>{p.estado}</td>
                    <td style={{ textAlign: 'right' }}>
                      {p.estado === 'borrador' ? (
                        <Link className="btn btn-primary" to={`/postulaciones/${p.id}`}>Continuar</Link>
                      ) : (
                        <Link className="btn" to={`/postulaciones/${p.id}`}>Ver</Link>
                      )}
                    </td>
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
