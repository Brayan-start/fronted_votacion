import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || '';
    const isBiometricError = 
      detail.toLowerCase().includes('facial') || 
      detail.toLowerCase().includes('rostro') || 
      detail.toLowerCase().includes('biometría');

    if (status === 401) {
      if (isBiometricError) {
        console.warn(`[BIOMETRIC ERROR] 401 at ${error.config?.url}: ${detail}`);
        // No redirigimos ni borramos token para errores biométricos
        return Promise.reject(error);
      } else {
        console.error(`[AUTH ERROR] 401 Unauthorized at ${error.config?.url}. Redirecting to login.`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      console.error(`[API ERROR] ${status} from ${error.config?.url}`, error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
