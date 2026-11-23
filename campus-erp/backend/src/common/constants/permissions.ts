export const PERMISSIONS = {
  STUDENT: {
    READ_OWN: 'student:read_own',
    WRITE_OWN: 'student:write_own',
  },
  FACULTY: {
    READ_COURSE: 'faculty:read_course',
    WRITE_ATTENDANCE: 'faculty:write_attendance',
    WRITE_MARKS: 'faculty:write_marks',
    READ_STUDENTS: 'faculty:read_students',
  },
  ADMIN: {
    READ_ALL: 'admin:read_all',
    WRITE_ALL: 'admin:write_all',
    MANAGE_USERS: 'admin:manage_users',
    MANAGE_COURSES: 'admin:manage_courses',
    MANAGE_FEES: 'admin:manage_fees',
    VIEW_ANALYTICS: 'admin:view_analytics',
  },
  SUPER_ADMIN: {
    FULL_ACCESS: 'super_admin:full_access',
    MANAGE_INSTITUTIONS: 'super_admin:manage_institutions',
    MANAGE_ADMINS: 'super_admin:manage_admins',
  },
} as const;

export const ROLE_HIERARCHY = {
  STUDENT: 1,
  PARENT: 2,
  FACULTY: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
} as const;
