import api from '../api';

const achievementsAdminService = {
  /** GET /admin/achievements?page=&limit= */
  getAchievements: async (params = {}) => {
    const res = await api.get('/admin/achievements', { params });
    return res.data.data; // { achievements, pagination }
  },

  /**
   * POST /admin/achievements
   * payload: { title, description?, date?, mediaUrl?, category?, order?, expiryMode?, customExpiryDays?, customExpiryDate? }
   */
  createAchievement: async (payload) => {
    const res = await api.post('/admin/achievements', payload);
    return res.data.data;
  },

  /** PATCH /admin/achievements/:id */
  updateAchievement: async (id, payload) => {
    const res = await api.patch(`/admin/achievements/${id}`, payload);
    return res.data.data;
  },

  /** DELETE /admin/achievements/:id */
  deleteAchievement: async (id) => {
    await api.delete(`/admin/achievements/${id}`);
  },

  /** POST /admin/achievements/upload-media */
  uploadMedia: async (formData) => {
    const res = await api.post('/admin/achievements/upload-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

export default achievementsAdminService;
