import api from './api';

const achievementService = {
  getAchievements: async (search = '', page = 1) => {
    const res = await api.get('/student/achievements', { params: { search, page } });
    return res.data;
  },
};

export default achievementService;
