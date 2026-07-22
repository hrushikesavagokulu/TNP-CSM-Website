import api from './api';

const resumeImprovementResourcesService = {
  getAll: () => api.get('/student/resume-guide/improvement-resources').then(r => r.data.data),
};

export default resumeImprovementResourcesService;
