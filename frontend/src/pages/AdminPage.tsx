import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

type Role = { id: number; nombre_rol: string };
type User = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  identificacion: string;
  roles?: Role[];
};
type Convocatoria = { id: number; nombre: string; descripcion?: string | null; fecha_apertura: string | Date; fecha_cierre: string | Date; estado: string; programa_academico_id?: number | null; cupos?: number | null; sede?: string | null; dedicacion?: string | null; tipo_vinculacion?: string | null; requisitos_documentales?: string[] | null; min_puntaje_aprobacion_documental?: number | null; min_puntaje_aprobacion_tecnica?: number | null };
type Programa = { id: number; nombre_programa: string; facultad?: string | null; nivel?: string | null; modalidad?: string | null; codigo_snies?: string | null; descripcion?: string | null };

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Convocatorias y postulaciones (gestión y filtros)
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  // CRUD Convocatorias (formulario crear/editar)
  const [newConv, setNewConv] = useState<{ nombre: string; descripcion: string; apertura: string; cierre: string; programa_academico_id: string; cupos: string; sede: string; dedicacion: string; tipo_vinculacion: string; requisitos_documentales: string; min_puntaje_documental: string; min_puntaje_tecnico: string }>({ nombre: '', descripcion: '', apertura: '', cierre: '', programa_academico_id: '', cupos: '', sede: '', dedicacion: '', tipo_vinculacion: '', requisitos_documentales: '', min_puntaje_documental: '0', min_puntaje_tecnico: '0' });
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editConv, setEditConv] = useState<{ nombre: string; descripcion: string; apertura: string; cierre: string; programa_academico_id: string; cupos: string; sede: string; dedicacion: string; tipo_vinculacion: string; requisitos_documentales: string; min_puntaje_documental: string; min_puntaje_tecnico: string }>({ nombre: '', descripcion: '', apertura: '', cierre: '', programa_academico_id: '', cupos: '', sede: '', dedicacion: '', tipo_vinculacion: '', requisitos_documentales: '', min_puntaje_documental: '0', min_puntaje_tecnico: '0' });
  const [postulaciones, setPostulaciones] = useState<Array<{ id: number; postulante_id: number; convocatoria_id: number; programa_id: number | null; estado: string; fecha_postulacion: string }>>([]);
  const [postQuery, setPostQuery] = useState<{ convocatoria?: number | ''; estado?: string; postulante?: number | ''; programa?: number | '' }>({});
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [newPrograma, setNewPrograma] = useState<Required<Pick<Programa, 'nombre_programa'>> & Partial<Programa>>({ nombre_programa: '', facultad: '', nivel: '', modalidad: '', codigo_snies: '', descripcion: '' });
  const [editingProgramaId, setEditingProgramaId] = useState<number | null>(null);
  const [editingPrograma, setEditingPrograma] = useState<Required<Pick<Programa, 'nombre_programa'>> & Partial<Programa>>({ nombre_programa: '', facultad: '', nivel: '', modalidad: '', codigo_snies: '', descripcion: '' });
  // Menú de acciones por fila
  type MenuKind = 'conv' | 'prog' | 'user';
  const [openMenu, setOpenMenu] = useState<{ type: MenuKind; id: number } | null>(null);
  type Section = 'convocatorias' | 'programas' | 'usuarios' | 'postulaciones';
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const isMenuOpen = (type: MenuKind, id: number) => openMenu && openMenu.type === type && openMenu.id === id;
  const toggleMenu = (type: MenuKind, id: number) => {
    setOpenMenu(prev => (prev && prev.type === type && prev.id === id ? null : { type, id }));
  };
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleBlockUser = async (uid: number) => {
    const ok = confirm('¿Bloquear usuario? (Acción pendiente de endpoint)');
    if (!ok) return;
    alert('Bloqueo de usuario pendiente de API/endpoint.');
  };
  const handleEditUser = (uid: number) => {
    alert('Edición de usuario pendiente de API/endpoint.');
  };

  // Gestión de roles: solo asignación (sin crear/editar/eliminar desde UI)

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // Búsqueda de usuarios
  const [userQuery, setUserQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const targetConv = params.get('convocatoria');
  const targetConvId = targetConv ? Number(targetConv) : undefined;

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      [u.nombre, u.apellido, u.email, u.identificacion]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [users, userQuery]);

  // Cargas perezosas por sección
  const loadUsersAndRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        api.get<Role[]>('/roles'),
        api.get<User[]>('/users'),
      ]);
      setRoles(rolesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error cargando usuarios/roles');
    } finally {
      setLoading(false);
    }
  };
  const loadConvocatoriasOnly = async () => {
    setLoading(true);
    setError(null);
    try {
      const [convocsRes, progsRes] = await Promise.all([
        api.get<Convocatoria[]>('/convocatorias'),
        api.get<Programa[]>('/programas-academicos'),
      ]);
      setConvocatorias(convocsRes.data || []);
      setProgramas(progsRes.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error cargando convocatorias');
    } finally {
      setLoading(false);
    }
  };
  const loadProgramasOnly = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Programa[]>('/programas-academicos');
      setProgramas(data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error cargando programas');
    } finally {
      setLoading(false);
    }
  };

  // Verificar que el usuario autenticado sea admin (ya validado por ProtectedRoute, esto es redundante pero por claridad)
  const isAdmin = (currentUser?.roles || [])
    .map((r: any) => String(r?.nombre_rol ?? r).toLowerCase())
    .includes('admin');

  // Cargar postulaciones con filtros (solo admin)
  const loadPostulaciones = async (q?: { convocatoria?: number | ''; estado?: string; postulante?: number | ''; programa?: number | '' }) => {
    setLoading(true);
    setError(null);
    try {
      const used = q ?? postQuery;
      const params = new URLSearchParams();
      if (used.convocatoria) params.set('convocatoria', String(used.convocatoria));
      if (used.estado) params.set('estado', String(used.estado));
      if (used.postulante) params.set('postulante', String(used.postulante));
      if (used.programa) params.set('programa', String(used.programa));
      const { data } = await api.get(`/postulaciones${params.toString() ? `?${params.toString()}` : ''}`);
      setPostulaciones(data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error cargando postulaciones');
    } finally {
      setLoading(false);
    }
  };

  // Accesibilidad: cerrar menús con Escape o clic fuera
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.actions')) setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, []);

  // Exportar CSV de postulaciones visibles
  const exportCsv = () => {
    if (!postulaciones.length) return;
    const headers = ['id','postulante_id','convocatoria_id','programa_id','estado','fecha_postulacion'];
    const rows = postulaciones.map(p => [p.id, p.postulante_id, p.convocatoria_id, (p.programa_id ?? ''), p.estado, new Date(p.fecha_postulacion).toISOString()]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => String(v).includes(',') ? `"${String(v).replace(/"/g,'""')}"` : String(v)).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const parts: string[] = [];
    if (postQuery.convocatoria) parts.push(`conv${postQuery.convocatoria}`);
    if (postQuery.programa) parts.push(`prog${postQuery.programa}`);
    if (postQuery.postulante) parts.push(`usr${postQuery.postulante}`);
    if (postQuery.estado) parts.push(postQuery.estado);
    const suffix = parts.length ? `_${parts.join('_')}` : '';
    a.download = `postulaciones${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helpers para convertir datetime-local a ISO (backend suele aceptar ISO)
  const toIso = (value: string) => value ? new Date(value).toISOString() : new Date().toISOString();
  const calcularEstado = (apertura: string, cierre: string) => {
    if (!apertura || !cierre) return 'borrador';
    const ap = new Date(apertura).getTime();
    const ci = new Date(cierre).getTime();
    const now = Date.now();
    if (now < ap) return 'borrador';
    if (now > ci) return 'cerrada';
    return 'publicada';
  };

  // Crear convocatoria
  const createConvocatoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConv.nombre.trim() || !newConv.apertura || !newConv.cierre) return;
    setLoading(true);
    setError(null);
    try {
      const requisitos = newConv.requisitos_documentales.trim() ? newConv.requisitos_documentales.split(',').map(r => r.trim()).filter(Boolean) : [];
      await api.post('/convocatorias', {
        nombre: newConv.nombre.trim(),
        descripcion: newConv.descripcion?.trim() || undefined,
        fecha_apertura: toIso(newConv.apertura),
        fecha_cierre: toIso(newConv.cierre),
        programa_academico_id: newConv.programa_academico_id ? Number(newConv.programa_academico_id) : undefined,
        cupos: newConv.cupos ? Number(newConv.cupos) : undefined,
        sede: newConv.sede?.trim() || undefined,
        dedicacion: newConv.dedicacion?.trim() || undefined,
        tipo_vinculacion: newConv.tipo_vinculacion?.trim() || undefined,
        requisitos_documentales: requisitos.length > 0 ? requisitos : undefined,
        min_puntaje_aprobacion_documental: newConv.min_puntaje_documental ? Number(newConv.min_puntaje_documental) : 0,
        min_puntaje_aprobacion_tecnica: newConv.min_puntaje_tecnico ? Number(newConv.min_puntaje_tecnico) : 0,
      });
      setNewConv({ nombre: '', descripcion: '', apertura: '', cierre: '', programa_academico_id: '', cupos: '', sede: '', dedicacion: '', tipo_vinculacion: '', requisitos_documentales: '', min_puntaje_documental: '0', min_puntaje_tecnico: '0' });
      await loadConvocatoriasOnly();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error creando convocatoria');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar edición
  const startEditConv = (c: Convocatoria) => {
    setEditingConvId(c.id);
    const ap = typeof c.fecha_apertura === 'string' ? c.fecha_apertura : (c.fecha_apertura as Date).toString();
    const ci = typeof c.fecha_cierre === 'string' ? c.fecha_cierre : (c.fecha_cierre as Date).toString();
    // Normalizar a datetime-local (YYYY-MM-DDTHH:mm)
    const toLocal = (d: string) => {
      const dt = new Date(d);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    };
    const requisitos = Array.isArray(c.requisitos_documentales) ? c.requisitos_documentales.join(', ') : '';
    setEditConv({
      nombre: c.nombre,
      descripcion: c.descripcion ?? '',
      apertura: toLocal(ap),
      cierre: toLocal(ci),
      programa_academico_id: c.programa_academico_id ? String(c.programa_academico_id) : '',
      cupos: c.cupos ? String(c.cupos) : '',
      sede: c.sede ?? '',
      dedicacion: c.dedicacion ?? '',
      tipo_vinculacion: c.tipo_vinculacion ?? '',
      requisitos_documentales: requisitos,
      min_puntaje_documental: c.min_puntaje_aprobacion_documental ? String(c.min_puntaje_aprobacion_documental) : '0',
      min_puntaje_tecnico: c.min_puntaje_aprobacion_tecnica ? String(c.min_puntaje_aprobacion_tecnica) : '0',
    });
  };

  const cancelEditConv = () => {
    setEditingConvId(null);
  setEditConv({ nombre: '', descripcion: '', apertura: '', cierre: '', programa_academico_id: '', cupos: '', sede: '', dedicacion: '', tipo_vinculacion: '', requisitos_documentales: '', min_puntaje_documental: '0', min_puntaje_tecnico: '0' });
  };

  const saveEditConv = async () => {
    if (!editingConvId) return;
    setLoading(true);
    setError(null);
    try {
      const requisitos = editConv.requisitos_documentales.trim() ? editConv.requisitos_documentales.split(',').map(r => r.trim()).filter(Boolean) : [];
      await api.patch(`/convocatorias/${editingConvId}`, {
        nombre: editConv.nombre.trim(),
        descripcion: editConv.descripcion?.trim() || undefined,
        fecha_apertura: toIso(editConv.apertura),
        fecha_cierre: toIso(editConv.cierre),
        programa_academico_id: editConv.programa_academico_id ? Number(editConv.programa_academico_id) : undefined,
        cupos: editConv.cupos ? Number(editConv.cupos) : undefined,
        sede: editConv.sede?.trim() || undefined,
        dedicacion: editConv.dedicacion?.trim() || undefined,
        tipo_vinculacion: editConv.tipo_vinculacion?.trim() || undefined,
        requisitos_documentales: requisitos.length > 0 ? requisitos : undefined,
        min_puntaje_aprobacion_documental: editConv.min_puntaje_documental ? Number(editConv.min_puntaje_documental) : 0,
        min_puntaje_aprobacion_tecnica: editConv.min_puntaje_tecnico ? Number(editConv.min_puntaje_tecnico) : 0,
      });
      cancelEditConv();
      await loadConvocatoriasOnly();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error actualizando convocatoria');
    } finally {
      setLoading(false);
    }
  };

  const deleteConv = async (id: number) => {
    if (!confirm('¿Eliminar esta convocatoria? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/convocatorias/${id}`);
      await loadConvocatoriasOnly();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error eliminando convocatoria');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Programas académicos
  const createPrograma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrograma.nombre_programa.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/programas-academicos', {
        nombre_programa: newPrograma.nombre_programa.trim(),
        facultad: newPrograma.facultad || undefined,
        nivel: newPrograma.nivel || undefined,
        modalidad: newPrograma.modalidad || undefined,
        codigo_snies: newPrograma.codigo_snies || undefined,
        descripcion: newPrograma.descripcion || undefined,
      });
      setNewPrograma({ nombre_programa: '', facultad: '', nivel: '', modalidad: '', codigo_snies: '', descripcion: '' });
      await loadProgramasOnly();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error creando programa');
    } finally {
      setLoading(false);
    }
  };

  const startEditPrograma = (p: Programa) => {
    setEditingProgramaId(p.id);
    setEditingPrograma({
      nombre_programa: p.nombre_programa,
      facultad: p.facultad ?? '',
      nivel: p.nivel ?? '',
      modalidad: p.modalidad ?? '',
      codigo_snies: p.codigo_snies ?? '',
      descripcion: p.descripcion ?? '',
    });
  };

  const cancelEditPrograma = () => {
    setEditingProgramaId(null);
    setEditingPrograma({ nombre_programa: '', facultad: '', nivel: '', modalidad: '', codigo_snies: '', descripcion: '' });
  };

  const saveEditPrograma = async () => {
    if (!editingProgramaId || !editingPrograma.nombre_programa.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/programas-academicos/${editingProgramaId}`, {
        nombre_programa: editingPrograma.nombre_programa.trim(),
        facultad: editingPrograma.facultad || undefined,
        nivel: editingPrograma.nivel || undefined,
        modalidad: editingPrograma.modalidad || undefined,
        codigo_snies: editingPrograma.codigo_snies || undefined,
        descripcion: editingPrograma.descripcion || undefined,
      });
      cancelEditPrograma();
      await loadProgramasOnly();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error actualizando programa');
    } finally {
      setLoading(false);
    }
  };

  const deletePrograma = async (id: number) => {
    if (!confirm('¿Eliminar este programa? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/programas-academicos/${id}`);
      await loadProgramasOnly();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error eliminando programa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      const current = selectedUser.roles?.map(r => r.id) || [];
      setSelectedRoleIds(current);
    } else {
      setSelectedRoleIds([]);
    }
  }, [selectedUser]);

  // Nota: la creación/edición/eliminación de roles se maneja fuera del panel (por despliegue/seed).

  const saveUserRoles = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    try {
      await api.put(`/users/${selectedUserId}`, { roles: selectedRoleIds });
      await loadUsersAndRoles();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error actualizando roles del usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-center" style={{ flexDirection: 'column' }}>
      <Header />
      <main className="admin-container fade-in-up" style={{ width: '100%', flex: 1 }}>
        <div className="page-subheader">
          <div className="left">
            <Link className="btn btn-icon btn-icon-brand" to="/perfil" aria-label="Volver al perfil" title="Volver">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <div className="title">Panel de Administración</div>
          <div className="right" />
        </div>

        {/* Aviso si no hay roles y botón de inicialización en dev */}
        {/* Si no es admin no mostramos nada del panel (fallback adicional) */}
        {!isAdmin && (
          <div className="section-card" style={{ borderColor: '#fee2e2', background: '#fff1f2', color: '#7f1d1d' }}>
            No autorizado. Debes ser administrador para acceder a este panel.
          </div>
        )}

        {/* Dashboard: accesos rápidos tipo tarjetas */}
        <section style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[{
              id: 'sec-convocatorias',
              title: 'Convocatorias',
              subtitle: 'Crear y gestionar',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            }, {
              id: 'sec-programas',
              title: 'Programas',
              subtitle: 'Oferta académica',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3l9 4-9 4-9-4 9-4z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 10v6l-9 5-9-5v-6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            }, {
              id: 'sec-usuarios',
              title: 'Usuarios',
              subtitle: 'Roles y permisos',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            }, {
              id: 'postulaciones-section',
              title: 'Postulaciones',
              subtitle: 'Consulta y exportación',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            }].map(card => (
              <button
                key={card.id}
                className="section-card hover-lift"
                onClick={async () => {
                  // Cambiar sección activa y cargar datos perezosamente
                  const map: Record<string, Section> = {
                    'sec-convocatorias': 'convocatorias',
                    'sec-programas': 'programas',
                    'sec-usuarios': 'usuarios',
                    'postulaciones-section': 'postulaciones',
                  };
                  const sec = map[card.id];
                  setActiveSection(prev => (prev === sec ? null : sec));
                  if (sec === 'convocatorias') await loadConvocatoriasOnly();
                  if (sec === 'programas') await loadProgramasOnly();
                  if (sec === 'usuarios') await loadUsersAndRoles();
                  if (sec === 'postulaciones') await loadPostulaciones();
                  setTimeout(() => scrollToId(card.id), 0);
                }}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: 14,
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div className="icon" style={{ color: '#0ea5e9' }}>{card.icon}</div>
                <div style={{ display: 'grid' }}>
                  <div style={{ fontWeight: 600 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{card.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

      {/* Convocatorias */}
      <div style={{ marginBottom: 16 }}>
        {activeSection === 'convocatorias' && (
        <details className="accordion" open id="sec-convocatorias">
          <summary>
            <span>Convocatorias</span>
            <span className="text-muted">Crear, editar y eliminar</span>
          </summary>
          <div className="accordion-content">
          <form onSubmit={createConvocatoria} className="stack" style={{ marginBottom: 12, padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Nueva Convocatoria</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <label>
                <span>Nombre *</span>
                <input className="input" value={newConv.nombre} onChange={(e) => setNewConv((p) => ({ ...p, nombre: e.target.value }))} required />
              </label>
              
              <label>
                <span>Programa Académico</span>
                <select className="input" value={newConv.programa_academico_id} onChange={(e) => setNewConv((p) => ({ ...p, programa_academico_id: e.target.value }))}>
                  <option value="">Seleccionar programa</option>
                  {programas.map(prog => <option key={prog.id} value={prog.id}>{prog.nombre_programa}</option>)}
                </select>
              </label>

              <label>
                <span>Cupos</span>
                <input className="input" type="number" min="1" value={newConv.cupos} onChange={(e) => setNewConv((p) => ({ ...p, cupos: e.target.value }))} placeholder="Ej: 5" />
              </label>

              <label>
                <span>Sede</span>
                <input className="input" value={newConv.sede} onChange={(e) => setNewConv((p) => ({ ...p, sede: e.target.value }))} placeholder="Ej: Mocoa, Valle del Guamuez" />
              </label>

              <label>
                <span>Dedicación</span>
                <select className="input" value={newConv.dedicacion} onChange={(e) => setNewConv((p) => ({ ...p, dedicacion: e.target.value }))}>
                  <option value="">Seleccionar</option>
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Cátedra">Cátedra</option>
                </select>
              </label>

              <label>
                <span>Tipo de Vinculación</span>
                <select className="input" value={newConv.tipo_vinculacion} onChange={(e) => setNewConv((p) => ({ ...p, tipo_vinculacion: e.target.value }))}>
                  <option value="">Seleccionar</option>
                  <option value="Laboral">Laboral</option>
                  <option value="Prestación de servicios">Prestación de servicios</option>
                  <option value="Honorarios">Honorarios</option>
                </select>
              </label>

              <label>
                <span>Apertura *</span>
                <input className="input" type="datetime-local" value={newConv.apertura} onChange={(e) => setNewConv((p) => ({ ...p, apertura: e.target.value }))} required />
              </label>

              <label>
                <span>Cierre *</span>
                <input className="input" type="datetime-local" value={newConv.cierre} onChange={(e) => setNewConv((p) => ({ ...p, cierre: e.target.value }))} required />
              </label>

              <label>
                <span>Puntaje Mín. Documental</span>
                <input className="input" type="number" step="0.1" min="0" value={newConv.min_puntaje_documental} onChange={(e) => setNewConv((p) => ({ ...p, min_puntaje_documental: e.target.value }))} />
              </label>

              <label>
                <span>Puntaje Mín. Técnico</span>
                <input className="input" type="number" step="0.1" min="0" value={newConv.min_puntaje_tecnico} onChange={(e) => setNewConv((p) => ({ ...p, min_puntaje_tecnico: e.target.value }))} />
              </label>
            </div>

            <label>
              <span>Descripción</span>
              <textarea className="input" value={newConv.descripcion} onChange={(e) => setNewConv((p) => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción de la convocatoria (opcional)" rows={3} />
            </label>

            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>Requisitos Documentales que el Postulante Debe Subir</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {['Hoja de vida', 'Cédula', 'Diplomas', 'Certificados laborales', 'Certificado de estudios', 'Referencias'].map(doc => (
                  <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newConv.requisitos_documentales.split(',').map(r => r.trim()).includes(doc)}
                      onChange={(e) => {
                        const current = newConv.requisitos_documentales.split(',').map(r => r.trim()).filter(Boolean);
                        if (e.target.checked) {
                          setNewConv(p => ({ ...p, requisitos_documentales: [...current, doc].join(', ') }));
                        } else {
                          setNewConv(p => ({ ...p, requisitos_documentales: current.filter(r => r !== doc).join(', ') }));
                        }
                      }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{doc}</span>
                  </label>
                ))}
              </div>
              <label>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Otros requisitos (separados por comas):</span>
                <input 
                  className="input" 
                  value={newConv.requisitos_documentales.split(',').map(r => r.trim()).filter(r => !['Hoja de vida', 'Cédula', 'Diplomas', 'Certificados laborales', 'Certificado de estudios', 'Referencias'].includes(r)).join(', ')} 
                  onChange={(e) => {
                    const predefined = ['Hoja de vida', 'Cédula', 'Diplomas', 'Certificados laborales', 'Certificado de estudios', 'Referencias'];
                    const current = newConv.requisitos_documentales.split(',').map(r => r.trim()).filter(r => predefined.includes(r));
                    const others = e.target.value.split(',').map(r => r.trim()).filter(Boolean);
                    setNewConv(p => ({ ...p, requisitos_documentales: [...current, ...others].join(', ') }));
                  }} 
                  placeholder="Ej: Carta de intención, Portafolio" 
                />
              </label>
            </fieldset>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="text-muted">Estado:</span>
              <span className={`badge ${calcularEstado(newConv.apertura, newConv.cierre) === 'publicada' ? 'success' : calcularEstado(newConv.apertura, newConv.cierre) === 'borrador' ? 'muted' : 'warning'}`}>
                {calcularEstado(newConv.apertura, newConv.cierre)}
              </span>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>Crear Convocatoria</button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Programa</th>
                  <th>Cupos</th>
                  <th>Sede</th>
                  <th>Apertura</th>
                  <th>Cierre</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {convocatorias.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nombre}</td>
                    <td>{c.programa_academico_id ? programas.find(p => p.id === c.programa_academico_id)?.nombre_programa ?? '—' : '—'}</td>
                    <td>{c.cupos ?? '—'}</td>
                    <td>{c.sede ?? '—'}</td>
                    <td>{new Date(c.fecha_apertura as any).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{new Date(c.fecha_cierre as any).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>
                      <span className={`badge ${c.estado === 'publicada' ? 'success' : c.estado === 'borrador' ? 'muted' : 'warning'}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {editingConvId === c.id ? (
                        <>
                          <button className="btn btn-sm btn-primary" onClick={saveEditConv} disabled={loading} style={{ marginRight: 6 }}>Guardar</button>
                          <button className="btn btn-sm btn-outline" onClick={cancelEditConv} disabled={loading}>Cancelar</button>
                        </>
                      ) : (
                        <div className="actions" onMouseLeave={() => setOpenMenu(null)}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline menu-btn"
                            aria-haspopup="menu"
                            aria-expanded={!!isMenuOpen('conv', c.id)}
                            onClick={() => toggleMenu('conv', c.id)}
                          >
                            Acciones ▾
                          </button>
                          <div className={`menu ${isMenuOpen('conv', c.id) ? '' : 'hidden'}`} role="menu">
                            <button className="menu-item" role="menuitem" onClick={() => { loadPostulaciones({ ...postQuery, convocatoria: c.id }); scrollToId('postulaciones-section'); setOpenMenu(null); }}>Ver postulaciones</button>
                            <button className="menu-item" role="menuitem" onClick={() => { startEditConv(c); setOpenMenu(null); }}>Editar</button>
                            <button className="menu-item" role="menuitem" onClick={() => { deleteConv(c.id); setOpenMenu(null); }}>Eliminar</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {convocatorias.length === 0 && (
                  <tr>
                    <td colSpan={9} className="empty-hint">Aún no hay convocatorias</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </details>
        )}

        {/* Programas Académicos */}
        {activeSection === 'programas' && (
        <details className="accordion" open id="sec-programas">
          <summary>
            <span>Programas académicos</span>
            <span className="text-muted">Gestiona la oferta de programas</span>
          </summary>
          <div className="accordion-content">
          <form onSubmit={createPrograma} className="form-row" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 2fr auto', marginBottom: 12 }}>
            <label>
              <span>Nombre del programa</span>
              <input className="input" value={newPrograma.nombre_programa} onChange={(e) => setNewPrograma(p => ({ ...p, nombre_programa: e.target.value }))} required />
            </label>
            <label>
              <span>Facultad</span>
              <input className="input" value={newPrograma.facultad ?? ''} onChange={(e) => setNewPrograma(p => ({ ...p, facultad: e.target.value }))} />
            </label>
            <label>
              <span>Nivel</span>
              <input className="input" placeholder="pregrado / posgrado" value={newPrograma.nivel ?? ''} onChange={(e) => setNewPrograma(p => ({ ...p, nivel: e.target.value }))} />
            </label>
            <label>
              <span>Modalidad</span>
              <input className="input" placeholder="presencial / virtual / mixta" value={newPrograma.modalidad ?? ''} onChange={(e) => setNewPrograma(p => ({ ...p, modalidad: e.target.value }))} />
            </label>
            <label>
              <span>SNIES</span>
              <input className="input" value={newPrograma.codigo_snies ?? ''} onChange={(e) => setNewPrograma(p => ({ ...p, codigo_snies: e.target.value }))} />
            </label>
            <label>
              <span>Descripción</span>
              <input className="input" value={newPrograma.descripcion ?? ''} onChange={(e) => setNewPrograma(p => ({ ...p, descripcion: e.target.value }))} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>Crear</button>
          </form>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Facultad</th>
                  <th>Nivel</th>
                  <th>Modalidad</th>
                  <th>SNIES</th>
                  <th>Descripción</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {programas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {editingProgramaId === p.id ? (
                        <input className="input" value={editingPrograma.nombre_programa} onChange={(e) => setEditingPrograma(s => ({ ...s, nombre_programa: e.target.value }))} />
                      ) : (
                        p.nombre_programa
                      )}
                    </td>
                    <td>
                      {editingProgramaId === p.id ? (
                        <input className="input" value={editingPrograma.facultad ?? ''} onChange={(e) => setEditingPrograma(s => ({ ...s, facultad: e.target.value }))} />
                      ) : (p.facultad ?? '—')}
                    </td>
                    <td>
                      {editingProgramaId === p.id ? (
                        <input className="input" value={editingPrograma.nivel ?? ''} onChange={(e) => setEditingPrograma(s => ({ ...s, nivel: e.target.value }))} />
                      ) : (p.nivel ?? '—')}
                    </td>
                    <td>
                      {editingProgramaId === p.id ? (
                        <input className="input" value={editingPrograma.modalidad ?? ''} onChange={(e) => setEditingPrograma(s => ({ ...s, modalidad: e.target.value }))} />
                      ) : (p.modalidad ?? '—')}
                    </td>
                    <td>
                      {editingProgramaId === p.id ? (
                        <input className="input" value={editingPrograma.codigo_snies ?? ''} onChange={(e) => setEditingPrograma(s => ({ ...s, codigo_snies: e.target.value }))} />
                      ) : (p.codigo_snies ?? '—')}
                    </td>
                    <td>
                      {editingProgramaId === p.id ? (
                        <input className="input" value={editingPrograma.descripcion ?? ''} onChange={(e) => setEditingPrograma(s => ({ ...s, descripcion: e.target.value }))} />
                      ) : (p.descripcion ?? '—')}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {editingProgramaId === p.id ? (
                        <>
                          <button className="btn btn-sm btn-primary" onClick={saveEditPrograma} disabled={loading} style={{ marginRight: 6 }}>Guardar</button>
                          <button className="btn btn-sm btn-outline" onClick={cancelEditPrograma} disabled={loading}>Cancelar</button>
                        </>
                      ) : (
                        <div className="actions" onMouseLeave={() => setOpenMenu(null)}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline menu-btn"
                            aria-haspopup="menu"
                            aria-expanded={!!isMenuOpen('prog', p.id)}
                            onClick={() => toggleMenu('prog', p.id)}
                          >
                            Acciones ▾
                          </button>
                          <div className={`menu ${isMenuOpen('prog', p.id) ? '' : 'hidden'}`} role="menu">
                            <button className="menu-item" role="menuitem" onClick={() => { loadPostulaciones({ ...postQuery, programa: p.id }); scrollToId('postulaciones-section'); setOpenMenu(null); }}>Ver postulaciones</button>
                            <button className="menu-item" role="menuitem" onClick={() => { startEditPrograma(p); setOpenMenu(null); }}>Editar</button>
                            <button className="menu-item" role="menuitem" onClick={() => { deletePrograma(p.id); setOpenMenu(null); }}>Eliminar</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {programas.length === 0 && (
                  <tr>
                    <td className="empty-hint" colSpan={8}>Aún no hay programas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </details>
        )}
      </div>
      {targetConvId ? (
        <div style={{ background: '#eef6ff', border: '1px solid #bcd8ff', padding: 10, margin: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>Convocatoria seleccionada: ID {targetConvId}</div>
          <Link className="btn" to="/admin">Quitar filtro</Link>
        </div>
      ) : null}

      {error && (
        <div className="section-card" style={{ borderColor: '#fecaca', background: '#fef2f2', color: '#7f1d1d', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        {activeSection === 'usuarios' && (
        <details className="accordion" open id="sec-usuarios">
          <summary>
            <span>Usuarios</span>
            <span className="text-muted">Listado, edición y asignación de roles</span>
          </summary>
          <div className="accordion-content">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input className="input" placeholder="Buscar por nombre, email o identificación" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
              </div>
              <div style={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                <table className="table sticky">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Identificación</th>
                      <th>Roles</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.nombre} {u.apellido}</td>
                        <td>{u.email}</td>
                        <td>{u.identificacion}</td>
                        <td>{(u.roles || []).map(r => (r as any).nombre_rol ?? '').filter(Boolean).join(', ') || 'Sin roles'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="actions" onMouseLeave={() => setOpenMenu(null)}>
                            <button className="btn btn-sm btn-outline menu-btn" onClick={() => toggleMenu('user', u.id)} aria-haspopup="menu" aria-expanded={!!isMenuOpen('user', u.id)}>Acciones ▾</button>
                            <div className={`menu ${isMenuOpen('user', u.id) ? '' : 'hidden'}`} role="menu">
                              <button className="menu-item" role="menuitem" onClick={() => { setSelectedUserId(u.id); scrollToId('user-roles'); setOpenMenu(null); }}>Roles</button>
                              <button className="menu-item" role="menuitem" onClick={() => { setSelectedUserId(u.id); scrollToId('user-edit'); setOpenMenu(null); }}>Modificar</button>
                              <button className="menu-item" role="menuitem" onClick={() => { loadPostulaciones({ ...postQuery, postulante: u.id }); scrollToId('postulaciones-section'); setOpenMenu(null); }}>Ver postulaciones</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={6} className="empty-hint">No hay usuarios</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              {/* Editor de usuario seleccionado */}
              <div id="user-edit" className="section-card" style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Editar usuario</div>
                {selectedUser ? (
                  <UserEditForm key={selectedUser.id} user={selectedUser} onSaved={async () => { await loadUsersAndRoles(); }} />
                ) : (
                  <div className="text-muted">Selecciona un usuario de la lista para editar.</div>
                )}
              </div>
              <div id="user-roles">Asignar roles:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {roles.map(r => {
                  const checked = selectedRoleIds.includes(r.id);
                  return (
                    <label key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setSelectedRoleIds(prev =>
                            isChecked ? [...prev, r.id] : prev.filter(id => id !== r.id)
                          );
                        }}
                        disabled={!selectedUserId || loading}
                      />
                      {r.nombre_rol}
                    </label>
                  );
                })}
              </div>
              <button className="btn btn-primary" onClick={saveUserRoles} disabled={!selectedUserId || loading} style={{ marginTop: 12 }}>
                Guardar cambios
              </button>
            </div>
          </div>
          </div>
        </details>
        )}
      </div>

      {activeSection === 'postulaciones' && (
      <details className="accordion" open id="postulaciones-section">
        <summary>
          <span>Postulaciones</span>
          <span className="text-muted">Filtros y consulta</span>
        </summary>
        <div className="accordion-content">
        {/* Resumen por convocatoria */}
        {postulaciones.length > 0 && (
          <div className="section-card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Resumen por convocatoria</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Convocatoria</th>
                    <th>Nombre</th>
                    <th>Postulantes</th>
                    <th>Estado</th>
                    <th>Apertura</th>
                    <th>Cierre</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    postulaciones.reduce((acc: Record<string, number>, p) => {
                      acc[String(p.convocatoria_id)] = (acc[String(p.convocatoria_id)] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([convId, count]) => {
                    const conv = convocatorias.find(c => String(c.id) === convId);
                    return (
                      <tr key={convId}>
                        <td>#{convId}</td>
                        <td>{conv?.nombre ?? '—'}</td>
                        <td>{count}</td>
                        <td><span className={`badge ${conv?.estado === 'publicada' ? 'success' : conv?.estado === 'borrador' ? 'muted' : 'warning'}`}>{conv?.estado ?? '—'}</span></td>
                        <td>{conv ? new Date(conv.fecha_apertura as any).toLocaleString() : '—'}</td>
                        <td>{conv ? new Date(conv.fecha_cierre as any).toLocaleString() : '—'}</td>
                        <td><button className="btn btn-sm" onClick={() => { setPostQuery(prev => ({ ...prev, convocatoria: Number(convId) })); }}>Ver detalles</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap', marginBottom: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Convocatoria</span>
            <select
              className="input"
              value={postQuery.convocatoria ?? ''}
              onChange={(e) => setPostQuery((prev) => ({ ...prev, convocatoria: e.target.value ? Number(e.target.value) : '' }))}
            >
              <option value="">Todas</option>
              {convocatorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} (#{c.id})</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Programa</span>
            <select
              className="input"
              value={postQuery.programa ?? ''}
              onChange={(e) => setPostQuery((prev) => ({ ...prev, programa: e.target.value ? Number(e.target.value) : '' }))}
            >
              <option value="">Todos</option>
              {programas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre_programa} (#{p.id})</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Estado</span>
            <select
              className="input"
              value={postQuery.estado ?? ''}
              onChange={(e) => setPostQuery((prev) => ({ ...prev, estado: e.target.value || undefined }))}
            >
              <option value="">Todos</option>
              <option value="borrador">borrador</option>
              <option value="enviado">enviado</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>ID Postulante</span>
            <input
              className="input"
              type="number"
              value={postQuery.postulante ?? ''}
              onChange={(e) => setPostQuery((prev) => ({ ...prev, postulante: e.target.value ? Number(e.target.value) : '' }))}
              placeholder="(opcional)"
            />
          </label>
          <button className="btn btn-primary" onClick={() => loadPostulaciones()} disabled={loading}>Aplicar filtros</button>
          <button className="btn btn-outline" onClick={exportCsv} disabled={loading || postulaciones.length === 0}>Exportar CSV</button>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
          <table className="table sticky">
            <thead>
              <tr>
                <th>ID</th>
                <th>Postulante</th>
                <th>Convocatoria</th>
                <th>Programa</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.postulante_id}</td>
                  <td>{p.convocatoria_id}</td>
                  <td>{p.programa_id ?? '—'}</td>
                  <td><span className={`badge ${p.estado === 'enviado' ? 'success' : 'muted'}`}>{p.estado}</span></td>
                  <td>{new Date(p.fecha_postulacion).toLocaleString()}</td>
                </tr>
              ))}
              {postulaciones.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-hint">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </details>
      )}

        {loading && <div className="section-card" style={{ marginTop: 8 }}>Procesando...</div>}
        
        {/* Modal de edición de convocatoria */}
        {editingConvId !== null && (
          <div className="modal-backdrop" onClick={cancelEditConv}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Convocatoria</h3>
                <button className="btn-close" onClick={cancelEditConv}>×</button>
              </div>
              <div className="modal-body stack">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <label>
                    <span>Nombre *</span>
                    <input className="input" value={editConv.nombre} onChange={(e) => setEditConv((p) => ({ ...p, nombre: e.target.value }))} required />
                  </label>
                  
                  <label>
                    <span>Programa Académico</span>
                    <select className="input" value={editConv.programa_academico_id} onChange={(e) => setEditConv((p) => ({ ...p, programa_academico_id: e.target.value }))}>
                      <option value="">Seleccionar programa</option>
                      {programas.map(prog => <option key={prog.id} value={prog.id}>{prog.nombre_programa}</option>)}
                    </select>
                  </label>

                  <label>
                    <span>Cupos</span>
                    <input className="input" type="number" min="1" value={editConv.cupos} onChange={(e) => setEditConv((p) => ({ ...p, cupos: e.target.value }))} />
                  </label>

                  <label>
                    <span>Sede</span>
                    <input className="input" value={editConv.sede} onChange={(e) => setEditConv((p) => ({ ...p, sede: e.target.value }))} placeholder="Ej: Mocoa, Valle del Guamuez" />
                  </label>

                  <label>
                    <span>Dedicación</span>
                    <select className="input" value={editConv.dedicacion} onChange={(e) => setEditConv((p) => ({ ...p, dedicacion: e.target.value }))}>
                      <option value="">Seleccionar</option>
                      <option value="Tiempo completo">Tiempo completo</option>
                      <option value="Medio tiempo">Medio tiempo</option>
                      <option value="Cátedra">Cátedra</option>
                    </select>
                  </label>

                  <label>
                    <span>Tipo de Vinculación</span>
                    <select className="input" value={editConv.tipo_vinculacion} onChange={(e) => setEditConv((p) => ({ ...p, tipo_vinculacion: e.target.value }))}>
                      <option value="">Seleccionar</option>
                      <option value="Laboral">Laboral</option>
                      <option value="Prestación de servicios">Prestación de servicios</option>
                      <option value="Honorarios">Honorarios</option>
                    </select>
                  </label>

                  <label>
                    <span>Apertura *</span>
                    <input className="input" type="datetime-local" value={editConv.apertura} onChange={(e) => setEditConv((p) => ({ ...p, apertura: e.target.value }))} required />
                  </label>

                  <label>
                    <span>Cierre *</span>
                    <input className="input" type="datetime-local" value={editConv.cierre} onChange={(e) => setEditConv((p) => ({ ...p, cierre: e.target.value }))} required />
                  </label>

                  <label>
                    <span>Puntaje Mín. Documental</span>
                    <input className="input" type="number" step="0.1" min="0" value={editConv.min_puntaje_documental} onChange={(e) => setEditConv((p) => ({ ...p, min_puntaje_documental: e.target.value }))} />
                  </label>

                  <label>
                    <span>Puntaje Mín. Técnico</span>
                    <input className="input" type="number" step="0.1" min="0" value={editConv.min_puntaje_tecnico} onChange={(e) => setEditConv((p) => ({ ...p, min_puntaje_tecnico: e.target.value }))} />
                  </label>
                </div>

                <label>
                  <span>Descripción</span>
                  <textarea className="input" value={editConv.descripcion} onChange={(e) => setEditConv((p) => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción de la convocatoria (opcional)" rows={3} />
                </label>

                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>Requisitos Documentales que el Postulante Debe Subir</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {['Hoja de vida', 'Cédula', 'Diplomas', 'Certificados laborales', 'Certificado de estudios', 'Referencias'].map(doc => (
                      <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={editConv.requisitos_documentales.split(',').map(r => r.trim()).includes(doc)}
                          onChange={(e) => {
                            const current = editConv.requisitos_documentales.split(',').map(r => r.trim()).filter(Boolean);
                            if (e.target.checked) {
                              setEditConv(p => ({ ...p, requisitos_documentales: [...current, doc].join(', ') }));
                            } else {
                              setEditConv(p => ({ ...p, requisitos_documentales: current.filter(r => r !== doc).join(', ') }));
                            }
                          }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{doc}</span>
                      </label>
                    ))}
                  </div>
                  <label>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Otros requisitos (separados por comas):</span>
                    <input 
                      className="input" 
                      value={editConv.requisitos_documentales.split(',').map(r => r.trim()).filter(r => !['Hoja de vida', 'Cédula', 'Diplomas', 'Certificados laborales', 'Certificado de estudios', 'Referencias'].includes(r)).join(', ')} 
                      onChange={(e) => {
                        const predefined = ['Hoja de vida', 'Cédula', 'Diplomas', 'Certificados laborales', 'Certificado de estudios', 'Referencias'];
                        const current = editConv.requisitos_documentales.split(',').map(r => r.trim()).filter(r => predefined.includes(r));
                        const others = e.target.value.split(',').map(r => r.trim()).filter(Boolean);
                        setEditConv(p => ({ ...p, requisitos_documentales: [...current, ...others].join(', ') }));
                      }} 
                      placeholder="Ej: Carta de intención, Portafolio" 
                    />
                  </label>
                </fieldset>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="text-muted">Estado:</span>
                  <span className={`badge ${calcularEstado(editConv.apertura, editConv.cierre) === 'publicada' ? 'success' : calcularEstado(editConv.apertura, editConv.cierre) === 'borrador' ? 'muted' : 'warning'}`}>
                    {calcularEstado(editConv.apertura, editConv.cierre)}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn" onClick={cancelEditConv}>Cancelar</button>
                <button className="btn btn-primary" onClick={saveEditConv} disabled={loading}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Editor de usuario simple inline
function UserEditForm({ user, onSaved }: { user: any; onSaved: () => Promise<void> | void }) {
  const [form, setForm] = useState({ nombre: user.nombre || '', apellido: user.apellido || '', email: user.email || '', identificacion: user.identificacion || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      await api.put(`/users/${user.id}`, form);
      setMsg('Guardado');
      await onSaved();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  };
  return (
    <div className="stack">
      <label>
        <span>Nombre</span>
        <input className="input" value={form.nombre} onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))} />
      </label>
      <label>
        <span>Apellido</span>
        <input className="input" value={form.apellido} onChange={(e) => setForm(p => ({ ...p, apellido: e.target.value }))} />
      </label>
      <label>
        <span>Email</span>
        <input className="input" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
      </label>
      <label>
        <span>Identificación</span>
        <input className="input" value={form.identificacion} onChange={(e) => setForm(p => ({ ...p, identificacion: e.target.value }))} />
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>Guardar</button>
        {msg && <div className="text-muted">{msg}</div>}
      </div>
    </div>
  );
}
