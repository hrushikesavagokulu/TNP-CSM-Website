import api from '../api';

const adminAchievementService = {
  list: async (search = '', page = 1) => {
    const res = await api.get('/admin/achievements', { params: { search, page } });
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post('/admin/achievements', payload);
    return res.data.data;
  },
  update: async (id, payload) => {
    const res = await api.patch(`/admin/achievements/${id}`, payload);
    return res.data.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/admin/achievements/${id}`);
    return res.data;
  },
};

export default adminAchievementService;
