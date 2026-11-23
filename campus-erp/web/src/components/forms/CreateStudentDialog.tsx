'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { departmentsApi, studentsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    enrollmentNo: '',
    departmentId: '',
    currentSemester: '1',
    phone: '',
  });

  const { data: departmentsData, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll({ limit: 100 }),
  });

  const departments = departmentsData?.data?.data ?? departmentsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      studentsApi.create({
        user: {
          create: {
            email: formData.email,
            password: formData.password,
            phone: formData.phone || undefined,
            role: 'STUDENT',
          },
        },
        firstName: formData.firstName,
        lastName: formData.lastName,
        enrollmentNo: formData.enrollmentNo,
        departmentId: formData.departmentId || undefined,
        currentSemester: parseInt(formData.currentSemester, 10),
      }),
    onSuccess: () => {
      toast.success('Student created successfully');
      setOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        enrollmentNo: '',
        departmentId: '',
        currentSemester: '1',
        phone: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create student');
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="text-lg font-semibold">Create New Student</DialogHeader>
          <DialogDescription>
            Add a new student record to the system
          </DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@campus.edu"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Rahul"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Sharma"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="enrollmentNo">Enrollment Number</Label>
                <Input
                  id="enrollmentNo"
                  placeholder="CSE24001"
                  required
                  value={formData.enrollmentNo}
                  onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value as string })}
                  disabled={createMutation.isPending}
                >
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder="Select department" />
                  </Select.Trigger>
                  {deptsLoading ? (
                    <Select.Content>
                      <Select.Item disabled value="loading" className="text-sm text-muted-foreground">
                        Loading departments...
                      </Select.Item>
                    </Select.Content>
                  ) : (
                    <Select.Content>
                      {departments.map((dept: any) => (
                        <Select.Item key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </Select.Item>
                      ))}
                    </Select.Content>
                  )}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSemester">Current Semester</Label>
              <Select
                value={formData.currentSemester}
                onValueChange={(value) => setFormData({ ...formData, currentSemester: value as string })}
                disabled={createMutation.isPending}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Select semester" />
                </Select.Trigger>
                <Select.Content>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <Select.Item key={sem} value={sem.toString()}>
                      Semester {sem}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={createMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Student'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateStudentDialog;
