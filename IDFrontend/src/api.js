import axios from 'axios';
import { validateEnv } from './config/env';

validateEnv();

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || 'https://sanju-sk-live.onrender.com';

// Attach JWT token to every request if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default axios;
