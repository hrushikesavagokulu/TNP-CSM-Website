import api from './api';

const learningResourceService = {
  getResources: async () => {
    const res = await api.get('/student/learning-resources');
    return res.data.data;
  },
};

export default learningResourceService;
