'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, coursesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Loader2, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  PRESENT: { label: 'Present', variant: 'success' },
  ABSENT: { label: 'Absent', variant: 'destructive' },
  LATE: { label: 'Late', variant: 'warning' },
  LEAVE: { label: 'Leave', variant: 'secondary' },
};

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: coursesData } = useQuery({
    queryKey: ['courses-dropdown'],
    queryFn: () => coursesApi.getAll(),
  });

  const courses = coursesData?.data?.data ?? coursesData?.data ?? [];

  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: ['attendance', selectedCourse, selectedDate],
    queryFn: () => attendanceApi.getByCourseAndDate(selectedCourse, selectedDate),
    enabled: !!selectedCourse && !!selectedDate,
  });

  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});

  const markMutation = useMutation({
    mutationFn: (records: { studentId: string; courseId: string; date: string; status: AttendanceStatus }[]) =>
      attendanceApi.markBulk(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance marked successfully');
    },
    onError: () => toast.error('Failed to mark attendance'),
  });

  const attendanceRecords = attendanceData?.data?.data ?? attendanceData?.data ?? [];

  const getStudents = () => {
    if (!attendanceRecords.length) return [];
    return attendanceRecords.map((record: any) => ({
      id: record.studentId || record.student?.id,
      name: record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown',
      enrollmentNo: record.student?.enrollmentNo || '-',
      status: record.status as AttendanceStatus,
    }));
  };

  const students = getStudents();

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = () => {
    if (!selectedCourse || !selectedDate) {
      toast.error('Please select course and date');
      return;
    }

    const records = students.map((s: any) => ({
      studentId: s.id,
      courseId: selectedCourse,
      date: selectedDate,
      status: attendanceState[s.id] || s.status || 'PRESENT',
    }));

    markMutation.mutate(records);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load attendance data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Mark and manage student attendance</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
              ))}
            </select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-48"
            />
            <Button
              onClick={handleMarkAll}
              disabled={!selectedCourse || markMutation.isPending}
            >
              {markMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CalendarCheck className="h-4 w-4 mr-2" />
              )}
              Mark Attendance
            </Button>
          </div>

          {!selectedCourse ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a course and date to manage attendance</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No students enrolled in this course</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium w-12">#</th>
                    <th className="pb-3 font-medium">Student Name</th>
                    <th className="pb-3 font-medium">Enrollment No</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any, idx: number) => {
                    const currentStatus = attendanceState[student.id] || student.status;
                    return (
                      <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-sm text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 font-medium">{student.name}</td>
                        <td className="py-3 text-sm font-mono">{student.enrollmentNo}</td>
                        <td className="py-3">
                          <div className="flex items-center justify-center gap-1">
                            {(['PRESENT', 'ABSENT', 'LATE', 'LEAVE'] as AttendanceStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student.id, status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                  currentStatus === status
                                    ? STATUS_CONFIG[status].variant === 'success'
                                      ? 'bg-green-100 text-green-700 ring-2 ring-green-500 dark:bg-green-900 dark:text-green-300'
                                      : STATUS_CONFIG[status].variant === 'destructive'
                                      ? 'bg-red-100 text-red-700 ring-2 ring-red-500 dark:bg-red-900 dark:text-red-300'
                                      : STATUS_CONFIG[status].variant === 'warning'
                                      ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500 dark:bg-yellow-900 dark:text-yellow-300'
                                      : 'bg-gray-100 text-gray-700 ring-2 ring-gray-500 dark:bg-gray-800 dark:text-gray-300'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                              >
                                {STATUS_CONFIG[status].label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
