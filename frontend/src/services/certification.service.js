import api from './api';

const certificationService = {
  getCertifications: async (semester) => {
    const params = semester ? { semester } : {};
    const res = await api.get('/student/certifications', { params });
    return res.data.data;
  },
};

export default certificationService;
