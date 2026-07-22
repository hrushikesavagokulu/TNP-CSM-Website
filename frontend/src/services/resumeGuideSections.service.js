import api from './api';

const resumeGuideSectionsService = {
  getAll: () => api.get('/student/resume-guide/building-guide').then(r => r.data.data),
};

export default resumeGuideSectionsService;
