import api from '../api';

const academicTransitionService = {
  previewRollover: async () => {
    const res = await api.get('/admin/academic-transition/preview');
    return res.data;
  },

  executeRollover: async () => {
    const res = await api.post('/admin/academic-transition/execute-rollover');
    return res.data;
  },

  adjustStudentYear: async (studentId, action, targetYear = null) => {
    const res = await api.put(`/admin/academic-transition/students/${studentId}/adjust-year`, {
      action,
      targetYear,
    });
    return res.data;
  },

  bulkAdjustYear: async (fromYear, action) => {
    const res = await api.post('/admin/academic-transition/bulk-adjust', {
      fromYear,
      action,
    });
    return res.data;
  },
};

export default academicTransitionService;
