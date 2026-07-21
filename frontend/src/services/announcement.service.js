import api from './api';

const announcementService = {
  /**
   * GET /student/announcement-groups
   * Returns array of group descriptors with live unread counts.
   * Shape: [{ groupId, label, type, unreadCount, year?, batchId? }]
   */
  getGroups: async () => {
    const res = await api.get('/student/announcement-groups');
    return res.data.data;
  },

  /**
   * GET /student/announcements?group=<groupId>&page=&limit=
   * Fetch announcements for a specific group.
   * groupId format: 'general' | 'year-N' | 'batch-<id>'
   */
  getAnnouncements: async (groupId, params = {}) => {
    const res = await api.get('/student/announcements', {
      params: { group: groupId, ...params },
    });
    return res.data.data; // { announcements, pagination }
  },

  /**
   * POST /student/announcements/:id/read
   * Mark an announcement as read (idempotent).
   */
  markAsRead: async (id) => {
    await api.post(`/student/announcements/${id}/read`);
  },
};

export default announcementService;
