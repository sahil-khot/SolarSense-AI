import api from './api';

export const authService = {
  // User Authentication
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async googleLogin(googleData) {
    const res = await api.post('/auth/google', googleData);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async checkUsername(username) {
    const res = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
    return res.data;
  },

  async checkEmail(email) {
    const res = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token, password) {
    const res = await api.put(`/auth/reset-password/${token}`, { password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Admin Authentication (Strictly isolated storage keys)
  async adminLogin(credentials) {
    const res = await api.post('/auth/admin/login', credentials);
    if (res.data.token) {
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
};
