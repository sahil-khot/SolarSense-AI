import api from './api';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getUsers(params) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async getUserDetails(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  async getReports() {
    const res = await api.get('/admin/reports');
    return res.data;
  },

  async getSettings() {
    const res = await api.get('/admin/settings');
    return res.data;
  },

  async updateSetting(id, value) {
    const res = await api.put(`/admin/settings/${id}`, { value });
    return res.data;
  },
};
