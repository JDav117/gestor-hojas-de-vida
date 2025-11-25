import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';
import { User } from '../types/entities';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { nombre: string; apellido: string; email: string; identificacion: string; telefono?: string; password: string }) => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'nombre'|'apellido'|'email'|'identificacion'|'telefono'>>) => Promise<void>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem('access_token'));
  // Nota: useToast es un hook, pero AuthProvider está por encima de ToastProvider en el árbol. En su lugar, usaremos window.dispatchEvent para una señal simple si no hay contexto.
  const toast = (() => {
    try { return (useToast as any)(); } catch { return null; }
  })();

  useEffect(() => {
    (async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (e: any) {
        // Solo cerrar sesión si es un error 401 (token inválido/expirado)
        if (e?.response?.status === 401) {
          console.warn('Token inválido o expirado, cerrando sesión');
          setUser(null);
          setToken(null);
          localStorage.removeItem('access_token');
        } else {
          // Para otros errores (red, servidor caído), mantener el token
          // y reintentar en la próxima navegación
          console.warn('Error temporal al cargar perfil, manteniendo sesión:', e?.message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function login(email: string, password: string): Promise<User> {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
      // Cargar perfil para tener roles y evitar bucles
      const me = await api.get('/auth/me');
      setUser(me.data);
      toast?.show('Sesión iniciada', 'success');
      return me.data; // Retornar el usuario para uso inmediato
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: { nombre: string; apellido: string; email: string; identificacion: string; password: string }) {
    await api.post('/auth/register', payload);
    toast?.show('Registro exitoso. Inicia sesión.', 'success');
  }

  async function updateProfile(data: Partial<Pick<User, 'nombre'|'apellido'|'email'|'identificacion'>>) {
    try {
      // Opción preferida: endpoint específico del perfil
      const { data: updated } = await api.put('/users/me', data);
      setUser((prev) => ({ ...(prev as any), ...updated }));
      toast?.show('Perfil actualizado', 'success');
    } catch (e: any) {
      // Fallback: actualizar por id si el endpoint /users/me no existe en el backend actual
      if (user?.id) {
        const { data: updated2 } = await api.put(`/users/${user.id}`, data);
        setUser((prev) => ({ ...(prev as any), ...updated2 }));
        toast?.show('Perfil actualizado', 'success');
      } else {
        toast?.show('No se pudo actualizar el perfil', 'error');
        throw e;
      }
    }
  }

  async function changePassword(payload: { currentPassword: string; newPassword: string }) {
    // Suponemos endpoint /auth/change-password o /users/me/password
    try {
      await api.post('/auth/change-password', payload);
      toast?.show('Contraseña actualizada', 'success');
    } catch (e: any) {
      // Fallback
      await api.put('/users/me/password', payload);
      toast?.show('Contraseña actualizada', 'success');
    }
  }

  function logout() {
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
    setLoading(false);
    toast?.show('Sesión cerrada', 'info');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, login, register, updateProfile, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
