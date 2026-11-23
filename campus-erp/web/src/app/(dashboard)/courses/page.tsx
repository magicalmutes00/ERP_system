'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, GraduationCap, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CreateCourseDialog } from '@/components/forms/CreateCourseDialog';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', search, departmentFilter],
    queryFn: () => coursesApi.getAll({ search, department: departmentFilter }),
  });

  const courses = data?.data?.data ?? data?.data ?? [];

  const getDepartmentColor = (dept?: string) => {
    const colors: Record<string, string> = {
      CSE: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      ECE: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      EEE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      ME: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      CE: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      IT: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    };
    return dept ? colors[dept] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load courses. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Browse and manage all courses</p>
        </div>
        <CreateCourseDialog />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'].map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded animate-pulse mb-3 w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse mb-2 w-1/2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => {
            const enrollmentCount = course._count?.enrollments ?? 0;
            const progressPercent = Math.min(100, Math.round((enrollmentCount / 60) * 100));

            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight">{course.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono mt-1">{course.code}</p>
                    </div>
                    <Badge className={getDepartmentColor(course.department?.name)}>
                      {course.department?.name || course.departmentId || 'General'}
                    </Badge>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>
                        {course.courseFaculty?.length
                          ? course.courseFaculty.map((cf: any) => cf.faculty.firstName + ' ' + cf.faculty.lastName).join(', ')
                          : 'No faculty assigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{enrollmentCount} students enrolled</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Capacity</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
