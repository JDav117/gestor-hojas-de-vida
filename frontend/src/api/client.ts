import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Request interceptor - Agregar token JWT
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || ({} as any);
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    const message = error.response?.data?.message || 'Error en el servidor';
    const status = error.response?.status;
    
    // Emitir evento para mostrar toast de error SOLO si no es 401
    // (los 401 se manejan en el AuthContext)
    if (status !== 401) {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { message, type: 'error' },
        })
      );
    }
    
    // NO redirigir automáticamente - dejar que AuthContext maneje los 401
    
    return Promise.reject(error);
  }
);

export default api;
