import api from './api';

const dsaService = {
  getTopics: async () => {
    const res = await api.get('/student/dsa/topics');
    return res.data.data;
  },
  getProblems: async (params = {}) => {
    const res = await api.get('/student/dsa/problems', { params });
    return res.data.data;
  },
};

export default dsaService;
