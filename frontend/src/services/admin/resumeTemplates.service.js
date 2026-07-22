import api from '../api';

const adminResumeTemplatesService = {
  getAll:         (category) => api.get('/admin/resume-templates', { params: category ? { category } : {} }).then(r => r.data.data),
  create:         (payload)  => api.post('/admin/resume-templates', payload).then(r => r.data.data),
  update:         (id, payload) => api.patch(`/admin/resume-templates/${id}`, payload).then(r => r.data.data),
  remove:         (id)       => api.delete(`/admin/resume-templates/${id}`).then(r => r.data),
  uploadFile:     (formData, templateId) =>
    api.post(`/admin/resume-templates/upload-file?templateId=${templateId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data),
  uploadPreview:  (formData, templateId) =>
    api.post(`/admin/resume-templates/upload-preview?templateId=${templateId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data),
};

export default adminResumeTemplatesService;
