import api from '../api';

const adminDsaService = {
  getTopics: async () => {
    const res = await api.get('/admin/dsa/topics');
    return res.data.data;
  },
  getProblems: async (params = {}) => {
    const res = await api.get('/admin/dsa/problems', { params });
    return res.data.data;
  },
  addProblem: async (data) => {
    const res = await api.post('/admin/dsa/problems', data);
    return res.data.data;
  },
  bulkAddProblems: async (problems) => {
    const res = await api.post('/admin/dsa/problems/bulk', { problems });
    return res.data.data;
  },
  updateProblem: async (id, data) => {
    const res = await api.patch(`/admin/dsa/problems/${id}`, data);
    return res.data.data;
  },
  deleteProblem: async (id) => {
    const res = await api.delete(`/admin/dsa/problems/${id}`);
    return res.data.data;
  },
  addOrUpdateTopic: async (data) => {
    const res = await api.post('/admin/dsa/topics', data);
    return res.data.data;
  },
  deleteTopic: async (id) => {
    const res = await api.delete(`/admin/dsa/topics/${id}`);
    return res.data.data;
  },
};

export default adminDsaService;
