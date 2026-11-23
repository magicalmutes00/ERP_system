import apiClient from './client';

export const authApi = {
  login: (data: {email: string; password: string}) =>
    apiClient.post('/auth/login', data),
  register: (data: any) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  refresh: () => apiClient.post('/auth/refresh'),
  verifyOtp: (data: {email: string; otp: string}) =>
    apiClient.post('/auth/verify-otp', data),
  forgotPassword: (data: {email: string}) =>
    apiClient.post('/auth/forgot-password', data),
  resetPassword: (data: {email: string; otp: string; newPassword: string}) =>
    apiClient.post('/auth/reset-password', data),
  getProfile: () => apiClient.get('/auth/profile'),
};
