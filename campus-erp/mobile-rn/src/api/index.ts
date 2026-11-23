import apiClient from './client';

export const studentsApi = {
  getAll: (params?: any) => apiClient.get('/students', {params}),
  getById: (id: string) => apiClient.get(`/students/${id}`),
  getMyProfile: () => apiClient.get('/students/me'),
  getAnalytics: (id: string) => apiClient.get(`/students/${id}/analytics`),
  create: (data: any) => apiClient.post('/students', data),
  update: (id: string, data: any) => apiClient.patch(`/students/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/${id}`),
};

export const departmentsApi = {
  getAll: (params?: any) => apiClient.get('/departments', {params}),
  getById: (id: string) => apiClient.get(`/departments/${id}`),
  create: (data: any) => apiClient.post('/departments', data),
  update: (id: string, data: any) => apiClient.patch(`/departments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/departments/${id}`),
};

export const facultyApi = {
  getAll: (params?: any) => apiClient.get('/faculty', {params}),
  getById: (id: string) => apiClient.get(`/faculty/${id}`),
  getMyProfile: () => apiClient.get('/faculty/me'),
  getMyCourses: () => apiClient.get('/faculty/me/courses'),
  getMySchedule: () => apiClient.get('/faculty/me/schedule'),
  create: (data: any) => apiClient.post('/faculty', data),
  update: (id: string, data: any) => apiClient.patch(`/faculty/${id}`, data),
  delete: (id: string) => apiClient.delete(`/faculty/${id}`),
};

export const coursesApi = {
  getAll: (params?: any) => apiClient.get('/courses', {params}),
  getById: (id: string) => apiClient.get(`/courses/${id}`),
  getProgress: (id: string) => apiClient.get(`/courses/${id}/progress`),
  getStudents: (id: string) => apiClient.get(`/courses/${id}/students`),
  create: (data: any) => apiClient.post('/courses', data),
  update: (id: string, data: any) => apiClient.patch(`/courses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/courses/${id}`),
};

export const attendanceApi = {
  getAll: (params?: any) => apiClient.get('/attendance/my', {params}),
  mark: (data: any) => apiClient.post('/attendance/mark', data),
  markBulk: (data: any[]) => apiClient.post('/attendance/bulk', data),
  getByCourseAndDate: (courseId: string, date: string) =>
    apiClient.get(`/attendance/course/${courseId}/date/${date}`),
  getMyAttendance: (params?: any) => apiClient.get('/attendance/my', {params}),
  getReport: (params?: any) =>
    apiClient.get('/attendance/report', {params}),
  getQR: (courseId: string) =>
    apiClient.get(`/attendance/qr/${courseId}`),
  markByQR: (data: any) => apiClient.post('/attendance/qr/mark', data),
};

export const examsApi = {
  getAll: (params?: any) => apiClient.get('/exams', {params}),
  getById: (id: string) => apiClient.get(`/exams/${id}`),
  getMyResults: () => apiClient.get('/exams/student/results'),
  create: (data: any) => apiClient.post('/exams', data),
  update: (id: string, data: any) => apiClient.patch(`/exams/${id}`, data),
  delete: (id: string) => apiClient.delete(`/exams/${id}`),
  publishResults: (id: string) => apiClient.post(`/exams/${id}/publish`),
  generateHallTicket: (examId: string, studentId: string) =>
    apiClient.post(`/exams/${examId}/hallticket/${studentId}`),
};

export const notificationsApi = {
  getAll: (params?: any) => apiClient.get('/notifications', {params}),
  getMyNotifications: (params?: any) =>
    apiClient.get('/notifications', {params}),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  getAnnouncements: () => apiClient.get('/notifications/announcements'),
};

export const assignmentsApi = {
  getAll: (params?: any) => apiClient.get('/assignments', {params}),
  getById: (id: string) => apiClient.get(`/assignments/${id}`),
  getByCourse: (courseId: string) => apiClient.get(`/assignments/course/${courseId}`),
};

export const feesApi = {
  getAll: (params?: any) => apiClient.get('/fees/structures', {params}),
  getMyFees: () => apiClient.get('/fees/analytics'),
  getStructures: () => apiClient.get('/fees/structures'),
  pay: (feeRecordId: string, data: any) =>
    apiClient.post(`/fees/${feeRecordId}/pay`, data),
  getPaymentHistory: () => apiClient.get('/fees/payments'),
};

export const timetableApi = {
  getAll: (params?: any) => apiClient.get('/timetable', {params}),
  getMySchedule: (facultyId?: string) =>
    apiClient.get(facultyId ? `/timetable/faculty/${facultyId}` : '/timetable'),
  getByDay: (day: number) => apiClient.get(`/timetable/day/${day}`),
};

export const chatApi = {
  getRooms: () => apiClient.get('/chat/rooms'),
  getRoomMessages: (roomId: string, params?: any) =>
    apiClient.get(`/chat/rooms/${roomId}/messages`, {params}),
  sendMessage: (roomId: string, data: {content: string; fileUrl?: string}) =>
    apiClient.post(`/chat/rooms/${roomId}/messages`, data),
  createRoom: (data: any) => apiClient.post('/chat/rooms', data),
};

export const aiApi = {
  chat: (data: {message: string; context?: string}) =>
    apiClient.post('/ai/chat', data),
  getInsights: () => apiClient.get('/ai/insights'),
  predictAttendance: (data: {courseId: string}) =>
    apiClient.post('/ai/attendance/predict', data),
  evaluate: (data: {question: string; answer: string; maxMarks: number}) =>
    apiClient.post('/ai/evaluate', data),
  summarize: (data: {content: string; maxLength?: number}) =>
    apiClient.post('/ai/summarize', data),
  recommendCourses: () => apiClient.post('/ai/recommend/courses'),
  generateTimetable: (data: {departmentId: string; semester: number}) =>
    apiClient.post('/ai/timetable/generate', data),
  getAtRiskStudents: (params?: any) =>
    apiClient.get('/ai/students/at-risk', {params}),
};
