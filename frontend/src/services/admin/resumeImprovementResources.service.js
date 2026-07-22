import api from '../api';

const adminImprovementResourcesService = {
  getAll:   () => api.get('/admin/resume-improvement-resources').then(r => r.data.data),
  create:   (p) => api.post('/admin/resume-improvement-resources', p).then(r => r.data.data),
  update:   (id, p) => api.patch(`/admin/resume-improvement-resources/${id}`, p).then(r => r.data.data),
  remove:   (id) => api.delete(`/admin/resume-improvement-resources/${id}`).then(r => r.data),
};

export default adminImprovementResourcesService;
