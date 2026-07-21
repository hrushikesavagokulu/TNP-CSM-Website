import api from './api';

const companyInfoService = {
  getCompanies: async (status, year) => {
    const params = {};
    if (status) params.status = status;
    if (year) params.year = year;
    const res = await api.get('/student/companies', { params });
    return res.data.data;
  },
  getCompanyById: async (id) => {
    const res = await api.get(`/student/companies/${id}`);
    return res.data.data;
  },
};

export default companyInfoService;
