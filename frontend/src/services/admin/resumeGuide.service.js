import api from '../api';

const adminResumeGuideService = {
  list:   async ()             => { const r = await api.get('/admin/resume-guide');          return r.data.data; },
  create: async (payload)      => { const r = await api.post('/admin/resume-guide', payload); return r.data.data; },
  update: async (id, payload)  => { const r = await api.patch(`/admin/resume-guide/${id}`, payload); return r.data.data; },
  remove: async (id)           => { await api.delete(`/admin/resume-guide/${id}`); },
};

export default adminResumeGuideService;
