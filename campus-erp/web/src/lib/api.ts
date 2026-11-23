import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
              headers: { Authorization: `Bearer ${refreshToken}` },
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  get api(): AxiosInstance {
    return this.client;
  }
}

export const api = new ApiClient().api;

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  verifyOtp: (data: { email: string; otp: string }) => api.post('/auth/verify-otp', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
};

export const studentsApi = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  getMyProfile: () => api.get('/students/me'),
  getAnalytics: (id: string) => api.get(`/students/${id}/analytics`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.patch(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const facultyApi = {
  getAll: (params?: any) => api.get('/faculty', { params }),
  getById: (id: string) => api.get(`/faculty/${id}`),
  getMyProfile: () => api.get('/faculty/me'),
  getMyCourses: () => api.get('/faculty/me/courses'),
  getMySchedule: () => api.get('/faculty/me/schedule'),
  create: (data: any) => api.post('/faculty', data),
  update: (id: string, data: any) => api.patch(`/faculty/${id}`, data),
  delete: (id: string) => api.delete(`/faculty/${id}`),
};

export const coursesApi = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  getProgress: (id: string) => api.get(`/courses/${id}/progress`),
  getStudents: (id: string) => api.get(`/courses/${id}/students`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

export const attendanceApi = {
  mark: (data: any) => api.post('/attendance/mark', data),
  markBulk: (data: any[]) => api.post('/attendance/bulk', data),
  getByCourseAndDate: (courseId: string, date: string) => api.get(`/attendance/course/${courseId}/date/${date}`),
  getMyAttendance: (params?: any) => api.get('/attendance/my', { params }),
  getReport: (params?: any) => api.get('/attendance/report', { params }),
  getQR: (courseId: string) => api.get(`/attendance/qr/${courseId}`),
  markByQR: (data: any) => api.post('/attendance/qr/mark', data),
};

export const examsApi = {
  getAll: (params?: any) => api.get('/exams', { params }),
  getById: (id: string) => api.get(`/exams/${id}`),
  getMyResults: () => api.get('/exams/student/results'),
  create: (data: any) => api.post('/exams', data),
  update: (id: string, data: any) => api.patch(`/exams/${id}`, data),
  delete: (id: string) => api.delete(`/exams/${id}`),
  publishResults: (id: string) => api.post(`/exams/${id}/publish`),
  generateHallTicket: (examId: string, studentId: string) => api.post(`/exams/${examId}/hallticket/${studentId}`),
};

export const departmentsApi = {
  getAll: (params?: any) => api.get('/departments', { params }),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: any) => api.post('/departments', data),
  update: (id: string, data: any) => api.patch(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export const notificationsApi = {
  getMyNotifications: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  getAnnouncements: () => api.get('/notifications/announcements'),
};

export const feesApi = {
  getMyFees: () => api.get('/fees/my'),
  getStructures: () => api.get('/fees/structures'),
  pay: (feeRecordId: string, data: any) => api.post(`/fees/${feeRecordId}/pay`, data),
  getPaymentHistory: () => api.get('/fees/payments'),
};

export const timetableApi = {
  getAll: (params?: any) => api.get('/timetable', { params }),
  getMySchedule: () => api.get('/timetable/my'),
  getByDay: (day: number) => api.get(`/timetable/day/${day}`),
};

export const chatApi = {
  getRooms: () => api.get('/chat/rooms'),
  getRoomMessages: (roomId: string, params?: any) => api.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (data: any) => api.post('/chat/messages', data),
  createRoom: (data: any) => api.post('/chat/rooms', data),
};

export const aiApi = {
  chat: (data: { message: string; context?: string }) => api.post('/ai/chat', data),
  getInsights: () => api.get('/ai/insights'),
  predictAttendance: (data: { courseId: string }) => api.post('/ai/attendance/predict', data),
  evaluate: (data: { question: string; answer: string; maxMarks: number }) => api.post('/ai/evaluate', data),
  summarize: (data: { content: string; maxLength?: number }) => api.post('/ai/summarize', data),
  recommendCourses: () => api.post('/ai/recommend/courses'),
  generateTimetable: (data: { departmentId: string; semester: number }) => api.post('/ai/timetable/generate', data),
  getAtRiskStudents: (params?: any) => api.get('/ai/students/at-risk', { params }),
};
