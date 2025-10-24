import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import Loader from './components/Loader';
import HomePage from './pages/HomePage';
import MisPostulaciones from './pages/MisPostulaciones';
import MisEvaluaciones from './pages/MisEvaluaciones';
import ConvocatoriasPage from './pages/ConvocatoriasPage';
import './styles/theme.css';
import { ToastProvider } from './context/ToastContext';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  // Mientras se resuelve /auth/me, no tomar decisiones de navegación
  if (loading) return <Loader />;
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + (location.search || ''));
    return <Navigate to={`/?auth=login&next=${next}`} replace />;
  }
  if (roles && roles.length > 0) {
    const names = (user?.roles || []).map((r: any) => String(r?.nombre_rol ?? r).toLowerCase());
    const target = roles.map((r) => r.toLowerCase());
    const allowed = target.some((r) => names.includes(r));
    if (!allowed) return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
            <Route path="/register" element={<Navigate to="/?auth=register" replace />} />
            <Route path="/convocatorias" element={<ConvocatoriasPage />} />
            <Route
              path="/mis-postulaciones"
              element={
                <ProtectedRoute>
                  <MisPostulaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-evaluaciones"
              element={
                <ProtectedRoute roles={["admin", "evaluador"]}>
                  <MisEvaluaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
