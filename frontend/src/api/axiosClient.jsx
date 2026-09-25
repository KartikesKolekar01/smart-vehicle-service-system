import axios from 'axios';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8083',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────── Attach Access Token to every request ───────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────── Auto Refresh on 401 ───────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // If 401 (expired) AND we haven't retried AND it's not auth endpoints
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/auth/login') &&
      !originalRequest.url.includes('/api/auth/register') &&
      !originalRequest.url.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Request new access token
          const res = await axios.post(
            'http://localhost:8083/api/auth/refresh',
            { refreshToken }
          );

          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;

          // Save new tokens
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed → logout
          localStorage.clear();
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Handle other errors
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    if (status === 401 && !originalRequest._retry) {
      localStorage.clear();
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('You are not authorized for this action');
    }

    return Promise.reject({ ...error, message });
  }
);

export default axiosClient;