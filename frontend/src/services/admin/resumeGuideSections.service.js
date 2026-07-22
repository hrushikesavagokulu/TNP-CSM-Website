import api from '../api';

const adminGuideSectionsService = {
  getAll:   ()              => api.get('/admin/resume-guide-sections').then(r => r.data.data),
  create:   (payload)       => api.post('/admin/resume-guide-sections', payload).then(r => r.data.data),
  update:   (id, payload)   => api.patch(`/admin/resume-guide-sections/${id}`, payload).then(r => r.data.data),
  remove:   (id)            => api.delete(`/admin/resume-guide-sections/${id}`).then(r => r.data),
  reorder:  (items)         => api.patch('/admin/resume-guide-sections/reorder', { items }).then(r => r.data),
};

export default adminGuideSectionsService;
