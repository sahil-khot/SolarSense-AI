import api from './api';

export const companyService = {
  async getCompanies(params = {}) {
    const res = await api.get('/companies', { params });
    return res.data;
  },

  async getCompanyById(id) {
    const res = await api.get(`/companies/${id}`);
    return res.data;
  },

  async matchCompanies(matchCriteria) {
    const res = await api.post('/companies/match', matchCriteria);
    return res.data;
  },
};
