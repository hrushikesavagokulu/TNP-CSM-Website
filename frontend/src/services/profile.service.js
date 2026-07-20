import api from './api';

const profileService = {
  /** GET /student/profile/me */
  getOwnProfile: async () => {
    const res = await api.get('/student/profile/me');
    return res.data.data;
  },

  /** GET /student/profile/:rollNo */
  getProfileByRollNo: async (rollNo) => {
    const res = await api.get(`/student/profile/${rollNo}`);
    return res.data.data;
  },

  /** PATCH /student/profile/me */
  updateProfile: async (payload) => {
    const res = await api.patch('/student/profile/me', payload);
    return res.data.data;
  },

  /** POST /student/profile/change-password (action: request) */
  requestPasswordChangeOTP: async () => {
    const res = await api.post('/student/profile/change-password', { action: 'request' });
    return res.data;
  },

  /** POST /student/profile/change-password (action: verify) */
  verifyPasswordChangeOTP: async (otp, newPassword) => {
    const res = await api.post('/student/profile/change-password', {
      action: 'verify',
      otp,
      newPassword,
    });
    return res.data;
  },

  /** GET /student/search?query= */
  searchStudents: async (query) => {
    const res = await api.get('/student/search', { params: { query } });
    return res.data.data;
  },

  /** GET /skills-catalogue */
  getSkillsCatalogue: async () => {
    const res = await api.get('/skills-catalogue');
    return res.data.data;
  },

  /** POST /student/profile/upload-photo */
  uploadPhoto: async (formData) => {
    const res = await api.post('/student/profile/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data; // { fileUrl }
  },

  /** POST /student/profile/upload-achievement */
  uploadAchievement: async (formData) => {
    const res = await api.post('/student/profile/upload-achievement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data; // { fileUrl }
  },
};

export default profileService;
