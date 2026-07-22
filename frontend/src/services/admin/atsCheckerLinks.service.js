import api from '../api';

const adminAtsLinksService = {
  getAll:   () => api.get('/admin/ats-checker-links').then(r => r.data.data),
  create:   (p) => api.post('/admin/ats-checker-links', p).then(r => r.data.data),
  update:   (id, p) => api.patch(`/admin/ats-checker-links/${id}`, p).then(r => r.data.data),
  remove:   (id) => api.delete(`/admin/ats-checker-links/${id}`).then(r => r.data),
};

export default adminAtsLinksService;
