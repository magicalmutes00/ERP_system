import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {tokenStorage} from '../services/storage';
import {API_BASE_URL} from '../config';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {'Content-Type': 'application/json'},
  timeout: 30000,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          null,
          {headers: {Authorization: `Bearer ${refreshToken}`}},
        );

        const {accessToken, refreshToken: newRefreshToken} = response.data;
        await tokenStorage.setAccessToken(accessToken);
        await tokenStorage.setRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await tokenStorage.clear();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
