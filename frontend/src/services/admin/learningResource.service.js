import api from '../api';

const adminLearningResourceService = {
  list:   async ()             => { const r = await api.get('/admin/learning-resources');       return r.data.data; },
  create: async (payload)      => { const r = await api.post('/admin/learning-resources', payload); return r.data.data; },
  update: async (id, payload)  => { const r = await api.patch(`/admin/learning-resources/${id}`, payload); return r.data.data; },
  remove: async (id)           => { await api.delete(`/admin/learning-resources/${id}`); },
};

export default adminLearningResourceService;
