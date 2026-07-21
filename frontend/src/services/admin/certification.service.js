import api from '../api';

const adminCertificationService = {
  list:   async (params = {}) => { const r = await api.get('/admin/certifications', { params }); return r.data.data; },
  create: async (payload)      => { const r = await api.post('/admin/certifications', payload);  return r.data.data; },
  update: async (id, payload)  => { const r = await api.patch(`/admin/certifications/${id}`, payload); return r.data.data; },
  remove: async (id)           => { await api.delete(`/admin/certifications/${id}`); },
};

export default adminCertificationService;
