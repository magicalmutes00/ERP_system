export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  institutionId?: string;
  student?: StudentProfile;
  faculty?: FacultyProfile;
  parent?: ParentProfile;
  admin?: AdminProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  enrollmentNo: string;
  dateOfBirth?: string;
  gender?: string;
  departmentId?: string;
  department?: Department;
  currentSemester: number;
  profilePic?: string;
  batch?: string;
  section?: string;
  rollNo?: string;
  parentId?: string;
  isActive: boolean;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  departmentId?: string;
  department?: Department;
  qualification?: string;
  isHOD: boolean;
  profilePic?: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  relationship: string;
  children: StudentProfile[];
}

export interface AdminProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  institutionId: string;
  hodId?: string;
  description?: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  departmentId?: string;
  department?: Department;
  isActive: boolean;
  courseFaculty?: CourseFaculty[];
  _count?: { enrollments: number; modules: number };
}

export interface CourseFaculty {
  id: string;
  courseId: string;
  facultyId: string;
  type: string;
  faculty: FacultyProfile;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  method?: string;
  course?: Course;
  student?: StudentProfile;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  type: string;
  totalMarks: number;
  duration: number;
  scheduledAt: string;
  course?: Course;
  isPublished: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  marksObtained?: number;
  grade?: string;
  points?: number;
  status: string;
  exam?: Exam;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  feeStructure?: FeeStructure;
  payments?: Payment[];
}

export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  type: string;
  frequency: string;
  dueDate?: string;
}

export interface Payment {
  id: string;
  feeRecordId: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  transactionId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  classroomId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: string;
  course?: Course;
  classroom?: Classroom;
}

export interface Classroom {
  id: string;
  buildingId: string;
  name: string;
  capacity: number;
  building?: Building;
}

export interface Building {
  id: string;
  name: string;
  code?: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
}

export interface ChatParticipant {
  id: string;
  roomId: string;
  userId: string;
  user?: User;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  sender?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
