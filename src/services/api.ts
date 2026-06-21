import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || '';
    const detailStr = typeof detail === 'string' ? detail : '';
    const isBiometricError = 
      detailStr.toLowerCase().includes('facial') || 
      detailStr.toLowerCase().includes('rostro') || 
      detailStr.toLowerCase().includes('biometría') ||
      detailStr.toLowerCase().includes('identidad') ||
      detailStr.toLowerCase().includes('coincide');

    if (status === 401 && isBiometricError) {
      return Promise.reject(error);
    }

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
