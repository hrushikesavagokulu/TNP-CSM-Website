import api from '../api';

const departmentInfoService = {
  // ── Department Info Singleton ──────────────────────────────────────────────
  
  getDepartmentInfo: async () => {
    const res = await api.get('/admin/department-info');
    return res.data.data;
  },

  updateDepartmentInfo: async (payload) => {
    const res = await api.patch('/admin/department-info', payload);
    return res.data.data;
  },

  uploadHeroImage: async (formData) => {
    const res = await api.post('/admin/department-info/upload-hero-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  uploadFacultyPhoto: async (formData) => {
    const res = await api.post('/admin/department-info/upload-faculty-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  // ── Faculty links CRUD ──────────────────────────────────────────────────────

  getFacultyLinks: async () => {
    const res = await api.get('/admin/department-info/faculty-links');
    return res.data.data;
  },

  createFacultyLink: async (payload) => {
    const res = await api.post('/admin/department-info/faculty-links', payload);
    return res.data.data;
  },

  updateFacultyLink: async (id, payload) => {
    const res = await api.patch(`/admin/department-info/faculty-links/${id}`, payload);
    return res.data.data;
  },

  deleteFacultyLink: async (id) => {
    const res = await api.delete(`/admin/department-info/faculty-links/${id}`);
    return res.data;
  },

  // ── Scheme syllabus links CRUD ─────────────────────────────────────────────

  getSchemeLinks: async () => {
    const res = await api.get('/admin/department-info/scheme-links');
    return res.data.data;
  },

  createSchemeLink: async (payload) => {
    const res = await api.post('/admin/department-info/scheme-links', payload);
    return res.data.data;
  },

  updateSchemeLink: async (id, payload) => {
    const res = await api.patch(`/admin/department-info/scheme-links/${id}`, payload);
    return res.data.data;
  },

  deleteSchemeLink: async (id) => {
    const res = await api.delete(`/admin/department-info/scheme-links/${id}`);
    return res.data;
  },
};

export default departmentInfoService;
