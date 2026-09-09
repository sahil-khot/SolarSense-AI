import api from './api';

export const billService = {
  async uploadBill(file) {
    const formData = new FormData();
    formData.append('billFile', file);
    const res = await api.post('/bills/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async verifyBill(id, verifiedData) {
    const res = await api.put(`/bills/${id}/verify`, verifiedData);
    return res.data;
  },

  async submitManualBill(billData) {
    const res = await api.post('/bills/manual', billData);
    return res.data;
  },

  async generateSolarRecommendationFromBill(id) {
    const res = await api.post(`/bills/${id}/generate-recommendation`);
    return res.data;
  },

  async getBillAnalytics() {
    const res = await api.get('/bills/analytics');
    return res.data;
  },

  async getBills() {
    const res = await api.get('/bills');
    return res.data;
  },

  async getBillById(id) {
    const res = await api.get(`/bills/${id}`);
    return res.data;
  },

  async deleteBill(id) {
    const res = await api.delete(`/bills/${id}`);
    return res.data;
  },
};
