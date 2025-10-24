import axios, { type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Asegurar objeto headers y asignar Authorization
    config.headers = config.headers || ({} as any);
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
