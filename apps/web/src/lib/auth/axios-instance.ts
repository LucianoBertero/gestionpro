import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let getAccessToken: (() => string | null) | null = null;
let onRefreshSuccess: ((accessToken: string) => void) | null = null;
let onRefreshFailure: (() => void) | null = null;

export function configureAuthInterceptors(config: {
  getAccessToken: () => string | null;
  onRefreshSuccess: (accessToken: string) => void;
  onRefreshFailure: () => void;
}) {
  getAccessToken = config.getAccessToken;
  onRefreshSuccess = config.onRefreshSuccess;
  onRefreshFailure = config.onRefreshFailure;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url === '/v1/auth/refresh-token') {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await api.get<{ data: { accessToken: string } }>(
        '/v1/auth/refresh-token'
      );
      const newAccessToken = response.data.data.accessToken;

      onRefreshSuccess?.(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      onRefreshFailure?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
