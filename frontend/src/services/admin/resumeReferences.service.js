import api from '../api';

const adminResumeReferencesService = {
  getAll:   (category) => api.get('/admin/resume-references', { params: category ? { category } : {} }).then(r => r.data.data),
  create:   (payload)  => api.post('/admin/resume-references', payload).then(r => r.data.data),
  update:   (id, p)    => api.patch(`/admin/resume-references/${id}`, p).then(r => r.data.data),
  remove:   (id)       => api.delete(`/admin/resume-references/${id}`).then(r => r.data),
};

export default adminResumeReferencesService;
