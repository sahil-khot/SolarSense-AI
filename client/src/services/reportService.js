import api from './api';

export const reportService = {
  async getReports() {
    const res = await api.get('/reports');
    return res.data;
  },

  async getReportById(id) {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  async generateReport(assessmentId) {
    const res = await api.post('/reports', { assessmentId });
    return res.data;
  },
};
