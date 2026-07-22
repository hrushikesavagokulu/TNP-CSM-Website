import api from '../api';

const resumeTemplatesService = {
  getAll:  (category) => api.get('/student/resume-guide/templates', { params: category ? { category } : {} }).then(r => r.data.data),
};

export default resumeTemplatesService;
