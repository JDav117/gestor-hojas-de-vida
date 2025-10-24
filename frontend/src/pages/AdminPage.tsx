import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useLocation, Link } from 'react-router-dom';

type Role = { id: number; nombre_rol: string };
type User = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  identificacion: string;
  roles?: Role[];
};

export default function AdminPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newRole, setNewRole] = useState('');

  // Edición/eliminación de roles
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editingRoleName, setEditingRoleName] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // Búsqueda de usuarios
  const [userQuery, setUserQuery] = useState('');
  const location = useLocation();
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

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        api.get<Role[]>('/roles'),
        api.get<User[]>('/users'),
      ]);
      setRoles(rolesRes.data);
      setUsers(usersRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const current = selectedUser.roles?.map(r => r.id) || [];
      setSelectedRoleIds(current);
    } else {
      setSelectedRoleIds([]);
    }
  }, [selectedUser]);

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    setLoading(true);
    setError(null);
    try {
  await api.post('/roles', { nombre_rol: newRole.trim() });
      setNewRole('');
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error creando rol');
    } finally {
      setLoading(false);
    }
  };

  const startEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setEditingRoleName(role.nombre_rol);
  };

  const cancelEditRole = () => {
    setEditingRoleId(null);
    setEditingRoleName('');
  };

  const saveEditRole = async () => {
    if (!editingRoleId || !editingRoleName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.put(`/roles/${editingRoleId}`, { nombre_rol: editingRoleName.trim() });
      cancelEditRole();
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error actualizando rol');
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: number) => {
    if (!confirm('¿Eliminar este rol? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/roles/${id}`);
      // Si el usuario seleccionado tenía ese rol, actualizamos selección
      setSelectedRoleIds(prev => prev.filter(rid => rid !== id));
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error eliminando rol');
    } finally {
      setLoading(false);
    }
  };

  const saveUserRoles = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    try {
      await api.put(`/users/${selectedUserId}`, { roles: selectedRoleIds });
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Error actualizando roles del usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>Panel de Administración</h2>
      {targetConvId ? (
        <div style={{ background: '#eef6ff', border: '1px solid #bcd8ff', padding: 10, margin: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>Convocatoria seleccionada: ID {targetConvId}</div>
          <Link className="btn" to="/admin">Quitar filtro</Link>
        </div>
      ) : null}

      {error && (
        <div style={{ background: '#ffe5e5', border: '1px solid #ffaaaa', padding: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <section style={{ marginBottom: 32 }}>
        <h3>Roles</h3>
        <form onSubmit={createRole} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Nombre del rol (ej: admin, postulante, evaluador)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
          <button type="submit" disabled={loading}>Crear rol</button>
        </form>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roles.map(r => (
            <li key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {editingRoleId === r.id ? (
                <>
                  <input
                    value={editingRoleName}
                    onChange={(e) => setEditingRoleName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button onClick={saveEditRole} disabled={loading}>Guardar</button>
                  <button type="button" onClick={cancelEditRole} disabled={loading}>Cancelar</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{r.nombre_rol}</span>
                  <button type="button" onClick={() => startEditRole(r)} disabled={loading}>Editar</button>
                  <button type="button" onClick={() => deleteRole(r.id)} disabled={loading}>Eliminar</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Usuarios</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          <div>
            <label>
              Selecciona un usuario:
              <input
                type="text"
                placeholder="Buscar por nombre, email o identificación"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                style={{ display: 'block', marginTop: 8, marginBottom: 8, width: '100%' }}
              />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                style={{ display: 'block', marginTop: 8 }}
              >
                <option value="">-- Selecciona --</option>
                {filteredUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.apellido} — {u.email}
                  </option>
                ))}
              </select>
            </label>
            {selectedUser && (
              <div style={{ marginTop: 12, fontSize: 14, color: '#555' }}>
                <div><strong>Identificación:</strong> {selectedUser.identificacion}</div>
                <div><strong>Roles actuales:</strong> {(selectedUser.roles || []).map(r => (r as any).nombre_rol ?? '').filter(Boolean).join(', ') || 'Sin roles'}</div>
              </div>
            )}
          </div>

          <div>
            <div>Asignar roles:</div>
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
            <button onClick={saveUserRoles} disabled={!selectedUserId || loading} style={{ marginTop: 12 }}>
              Guardar cambios
            </button>
          </div>
        </div>
      </section>

      {loading && <div style={{ marginTop: 16 }}>Procesando...</div>}
    </div>
  );
}
