import axios from 'axios';

/**
 * api.js — base Axios instance used throughout the entire frontend.
 *
 * baseURL '/api/v1' works in both environments:
 *   - Dev  → Vite's proxy forwards /api/* to localhost:5000
 *   - Prod → nginx.conf proxy forwards /api/* to http://backend:5000/api/
 *
 * withCredentials: true is required so httpOnly JWT cookies are sent
 * with every request (wired in Phase 1 auth).
 */
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// ── Request interceptor (pass-through) ───────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error)  => Promise.reject(error)
);

// ── Response interceptor: 401 → refresh → retry ──────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

function processQueue(error) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that aren't themselves the refresh call
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/me')
    ) {
      if (isRefreshing) {
        // Queue additional requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh-token');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — session is truly over; clear cookies via backend
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        // Let the app handle redirect via AuthContext user becoming null
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

