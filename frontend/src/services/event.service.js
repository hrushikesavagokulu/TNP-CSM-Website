import api from './api';

const eventService = {
  getStudentEvents: async () => {
    const res = await api.get('/student/events');
    return res.data;
  },

  getEventBySlug: async (slug) => {
    const res = await api.get(`/student/events/by-slug/${slug}`);
    return res.data;
  },

  submitStudentInfo: async (eventId, data) => {
    const res = await api.post(`/student/events/${eventId}/submit-info`, data);
    return res.data;
  },

  uploadCertificate: async (eventId, certificateName, file) => {
    const formData = new FormData();
    formData.append('certificateName', certificateName);
    formData.append('file', file);

    const res = await api.post(`/student/events/${eventId}/upload-certificate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getMySubmission: async (eventId) => {
    const res = await api.get(`/student/events/${eventId}/my-submission`);
    return res.data;
  },

  deleteSingleCertificate: async (eventId, certId) => {
    const res = await api.delete(`/student/events/${eventId}/certificates/${certId}`);
    return res.data;
  },
};

export default eventService;
