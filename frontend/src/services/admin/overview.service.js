import api from '../api';

const overviewService = {
  /** Fetch all admin overview statistics in a single call */
  getStats: async () => {
    const { data } = await api.get('/api/v1/admin/overview-stats');
    return data.data;
  },
};

export default overviewService;
