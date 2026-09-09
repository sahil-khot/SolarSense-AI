import api from './api';

export const solarService = {
  async quickEstimate(params) {
    const res = await api.post('/solar/quick-estimate', params);
    return res.data;
  },

  async runAssessment(assessmentData) {
    const res = await api.post('/solar/assess', assessmentData);
    return res.data;
  },

  async getLatestAssessment() {
    const res = await api.get('/solar/latest');
    return res.data;
  },

  async getAssessments() {
    const res = await api.get('/solar/assessments');
    return res.data;
  },

  async getAssessmentById(id) {
    const res = await api.get(`/solar/assessments/${id}`);
    return res.data;
  },

  async getEnergyProfile() {
    const res = await api.get('/users/energy-profile');
    return res.data;
  },
};
