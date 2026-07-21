import api from '../api';

const adminSkillRoadmapService = {
  list:   async (params = {}) => { const r = await api.get('/admin/skill-roadmap', { params }); return r.data.data; },
  create: async (payload)      => { const r = await api.post('/admin/skill-roadmap', payload);  return r.data.data; },
  update: async (id, payload)  => { const r = await api.patch(`/admin/skill-roadmap/${id}`, payload); return r.data.data; },
  remove: async (id)           => { await api.delete(`/admin/skill-roadmap/${id}`); },
};

export default adminSkillRoadmapService;
