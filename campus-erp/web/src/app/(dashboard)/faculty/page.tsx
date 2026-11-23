'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { facultyApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, Mail, GraduationCap, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CreateFacultyDialog } from '@/components/forms/CreateFacultyDialog';

export default function FacultyPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['faculty', search, departmentFilter],
    queryFn: () => facultyApi.getAll({ search, department: departmentFilter }),
  });

  const facultyMembers = data?.data?.data ?? data?.data ?? [];

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'success' : 'destructive'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load faculty. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty</h1>
          <p className="text-muted-foreground">Manage faculty members and their profiles</p>
        </div>
        <CreateFacultyDialog />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Faculty ({facultyMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, employee ID, or email..."
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
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : facultyMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No faculty members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Employee ID</th>
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium">Qualification</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyMembers.map((member: any) => (
                    <tr key={member.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-medium">{member.firstName} {member.lastName}</span>
                            {member.isHOD && (
                              <Badge variant="secondary" className="ml-2 text-xs">HOD</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-mono">{member.employeeId}</td>
                      <td className="py-3 text-sm">{member.department?.name || member.departmentId || '-'}</td>
                      <td className="py-3 text-sm">{member.qualification || '-'}</td>
                      <td className="py-3 text-sm">
                        <div className="flex flex-col gap-1">
                          {member.user?.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{member.user.email}</span>
                            </div>
                          )}
                          {member.user?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{member.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3">{getStatusBadge(member.user?.isActive ?? true)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
