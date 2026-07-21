import api from '../api';

const adminCompanyService = {
  list: async (params = {}) => {
    const res = await api.get('/admin/companies', { params });
    return res.data.data;
  },
  create: async (payload) => {
    const res = await api.post('/admin/companies', payload);
    return res.data.data;
  },
  update: async (id, payload) => {
    const res = await api.patch(`/admin/companies/${id}`, payload);
    return res.data.data;
  },
  remove: async (id) => {
    await api.delete(`/admin/companies/${id}`);
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/admin/companies/${id}/status`, { status });
    return res.data.data;
  },
  linkAlumniRepo: async (id, alumniRepoId) => {
    const res = await api.post(`/admin/companies/${id}/link-alumni-repo`, { alumniRepoId });
    return res.data.data;
  },
};

export default adminCompanyService;
