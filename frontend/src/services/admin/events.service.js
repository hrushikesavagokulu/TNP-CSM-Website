import api from '../api';

const adminEventsService = {
  getServiceAccountEmail: async () => {
    const res = await api.get('/admin/events/service-account-email');
    return res.data;
  },

  getEvents: async () => {
    const res = await api.get('/admin/events');
    return res.data;
  },

  createEvent: async (data) => {
    const res = await api.post('/admin/events', data);
    return res.data;
  },

  updateEvent: async (id, data) => {
    const res = await api.patch(`/admin/events/${id}`, data);
    return res.data;
  },

  getEventRegistrations: async (id) => {
    const res = await api.get(`/admin/events/${id}/registrations`);
    return res.data;
  },

  getEventShareLink: async (id) => {
    const res = await api.get(`/admin/events/${id}/share-link`);
    return res.data;
  },

  downloadEventZip: async (id, batchLabel = 'certificates') => {
    const response = await api.get(`/admin/events/${id}/download-zip`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${batchLabel}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteEvent: async (id, batchLabel = 'certificates') => {
    const response = await api.delete(`/admin/events/${id}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${batchLabel}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default adminEventsService;
