import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: dynamically inject user or admin JWT token
api.interceptors.request.use(
  (config) => {
    // If route targets admin endpoint, prioritize admin token
    if (config.url?.startsWith('/admin')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
      }
    }

    // Default to standard user token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: uniform error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message || error.message;
    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      message = 'Analysis timed out. Please verify your bill file is clear and try again.';
    } else if (!message) {
      message = 'An unexpected network error occurred. Please check your connection.';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
