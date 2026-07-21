import api from '../api';

const adminAlumniRepoService = {
  list: async () => {
    const res = await api.get('/admin/alumni-repos');
    return res.data.data;
  },
  create: async (payload) => {
    const res = await api.post('/admin/alumni-repos', payload);
    return res.data.data;
  },
  update: async (id, payload) => {
    const res = await api.patch(`/admin/alumni-repos/${id}`, payload);
    return res.data.data;
  },
  remove: async (id) => {
    await api.delete(`/admin/alumni-repos/${id}`);
  },
};

export default adminAlumniRepoService;
