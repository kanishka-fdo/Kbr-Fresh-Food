import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kbr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kbr_token');
      localStorage.removeItem('kbr_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    if (err.response?.status === 403) {
      const message = err.response?.data?.message || 'You do not have permission to perform this action.';
      toast.error(message, { duration: 4000, id: 'forbidden-toast' });
    }
    return Promise.reject(err);
  }
);

export default api;

