import api from './api';

export const chatService = {
  sendMessage: async (message) => {
    const res = await api.post('/chat', { message });
    return res.data;
  },

  getHistory: async () => {
    const res = await api.get('/chat/history');
    return res.data;
  },

  clearHistory: async () => {
    const res = await api.delete('/chat/history');
    return res.data;
  },

  getStatus: async () => {
    const res = await api.get('/chat/status');
    return res.data;
  },
};
