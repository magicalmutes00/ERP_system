'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { departmentsApi, facultyApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function CreateFacultyDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    departmentId: '',
    qualification: '',
    phone: '',
  });

  const { data: departmentsData, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll({ limit: 100 }),
  });

  const departments = departmentsData?.data?.data ?? departmentsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      facultyApi.create({
        user: {
          create: {
            email: formData.email,
            password: formData.password,
            phone: formData.phone || undefined,
            role: 'FACULTY',
          },
        },
        firstName: formData.firstName,
        lastName: formData.lastName,
        employeeId: formData.employeeId,
        departmentId: formData.departmentId || undefined,
        qualification: formData.qualification || undefined,
      }),
    onSuccess: () => {
      toast.success('Faculty created successfully');
      setOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        employeeId: '',
        departmentId: '',
        qualification: '',
        phone: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create faculty');
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="text-lg font-semibold">Create New Faculty</DialogHeader>
          <DialogDescription>
            Add a new faculty member to the system
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
                  placeholder="faculty@campus.edu"
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
                  placeholder="Dr. Anita"
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
                  placeholder="Desai"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  placeholder="FAC1001"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
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
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                placeholder="M.Tech, Ph.D."
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                disabled={createMutation.isPending}
              />
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
              {createMutation.isPending ? 'Creating...' : 'Create Faculty'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateFacultyDialog;
