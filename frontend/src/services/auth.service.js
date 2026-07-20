import api from './api';

const authService = {
  /** POST /auth/check-availability */
  checkAvailability: async (params) => {
    const res = await api.post('/auth/check-availability', params);
    return res.data.data;
  },

  /** POST /auth/register — sends OTP */
  register: async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  /** POST /auth/verify-otp — completes registration, returns user */
  verifyOtp: async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data.data; // user object
  },

  /** POST /auth/login */
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data; // user object
  },

  /** POST /auth/forgot-password */
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  /** POST /auth/verify-reset-otp */
  verifyResetOtp: async (email, otp) => {
    const res = await api.post('/auth/verify-reset-otp', { email, otp });
    return res.data.data; // { resetToken }
  },

  /** POST /auth/reset-password */
  resetPassword: async (resetToken, newPassword) => {
    const res = await api.post('/auth/reset-password', { resetToken, newPassword });
    return res.data;
  },

  /** POST /auth/logout */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /** POST /auth/refresh-token */
  refreshToken: async () => {
    await api.post('/auth/refresh-token');
  },

  /** GET /auth/me — returns user or throws */
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};

export default authService;
