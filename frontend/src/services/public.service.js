import api from './api';

const publicService = {
  /** GET /public/department-info */
  getDepartmentInfo: async () => {
    const res = await api.get('/public/department-info');
    return res.data.data;
  },

  /** GET /public/faculty-links */
  getFacultyLinks: async () => {
    const res = await api.get('/public/faculty-links');
    return res.data.data;
  },

  /** GET /public/scheme-links */
  getSchemeLinks: async () => {
    const res = await api.get('/public/scheme-links');
    return res.data.data;
  },
};

export default publicService;
