import api from './api';

const resumeGuideService = {
  getGuide: async () => {
    const res = await api.get('/student/resume-guide');
    return res.data.data;
  },
};

export default resumeGuideService;
