import api from '../../services/api';

const adminsService = {
  /** GET /admin/admins */
  getAdmins: async () => {
    const res = await api.get('/admin/admins');
    return res.data.data; // { activeAdmins, pendingInvites }
  },

  /** POST /admin/admins */
  addAdminInvite: async (email) => {
    const res = await api.post('/admin/admins', { email });
    return res.data.data;
  },

  /** POST /admin/admins/create-credentials */
  createAdminCredentials: async (payload) => {
    const res = await api.post('/admin/admins/create-credentials', payload);
    return res.data;
  },

  /** DELETE /admin/admins/:id */
  deleteAdminOrInvite: async (id) => {
    await api.delete(`/admin/admins/${id}`);
  },
};

export default adminsService;
