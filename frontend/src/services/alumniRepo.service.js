import api from './api';

const alumniRepoService = {
  getAlumniRepos: async (companyId) => {
    const params = {};
    if (companyId) params.company = companyId;
    const res = await api.get('/student/alumni-repos', { params });
    return res.data.data;
  },
};

export default alumniRepoService;
