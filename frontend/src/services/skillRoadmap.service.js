import api from './api';

const skillRoadmapService = {
  getRoadmap: async (semester) => {
    const params = semester ? { semester } : {};
    const res = await api.get('/student/skill-roadmap', { params });
    return res.data.data;
  },
  toggleChecklist: async (itemId) => {
    const res = await api.patch(`/student/roadmap-checklist/${itemId}`);
    return res.data.data;
  },
};

export default skillRoadmapService;
