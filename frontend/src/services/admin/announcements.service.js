import api from '../api';

const announcementsAdminService = {
  /** GET /admin/announcements?page=&limit= */
  getAnnouncements: async (params = {}) => {
    const res = await api.get('/admin/announcements', { params });
    return res.data.data; // { announcements, pagination }
  },

  /**
   * POST /admin/announcements
   * payload: { title, body, attachments?, isGeneral?, targetYears?, targetBatches? }
   * At least one of isGeneral/targetYears/targetBatches must be set.
   */
  createAnnouncement: async (payload) => {
    const res = await api.post('/admin/announcements', payload);
    return res.data.data;
  },

  /**
   * PATCH /admin/announcements/:id
   * Partial update — only include fields you want to change.
   */
  updateAnnouncement: async (id, payload) => {
    const res = await api.patch(`/admin/announcements/${id}`, payload);
    return res.data.data;
  },

  /** DELETE /admin/announcements/:id */
  deleteAnnouncement: async (id) => {
    await api.delete(`/admin/announcements/${id}`);
  },
};

export default announcementsAdminService;
