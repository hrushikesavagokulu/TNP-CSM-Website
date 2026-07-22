import api from '../api';

const atsCheckerLinksService = {
  getAll: () => api.get('/student/resume-guide/ats-links').then(r => r.data.data),
};

export default atsCheckerLinksService;
