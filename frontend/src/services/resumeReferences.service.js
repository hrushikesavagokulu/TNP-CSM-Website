import api from './api';

const resumeReferencesService = {
  getAll: (category) => api.get('/student/resume-guide/references', { params: category ? { category } : {} }).then(r => r.data.data),
};

export default resumeReferencesService;
