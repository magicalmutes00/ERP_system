export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  student?: {
    firstName: string;
    lastName: string;
    enrollmentNo: string;
  };
  faculty?: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  admin?: {
    firstName: string;
    lastName: string;
  };
  parent?: {
    firstName: string;
    lastName: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
