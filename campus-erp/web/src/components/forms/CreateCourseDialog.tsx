'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { departmentsApi, coursesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: '3',
    departmentId: '',
  });

  const { data: departmentsData, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll({ limit: 100 }),
  });

  const departments = departmentsData?.data?.data ?? departmentsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      coursesApi.create({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        credits: parseInt(formData.credits, 10),
        departmentId: formData.departmentId || undefined,
      }),
    onSuccess: () => {
      toast.success('Course created successfully');
      setOpen(false);
      setFormData({ name: '', code: '', description: '', credits: '3', departmentId: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="text-lg font-semibold">Create New Course</DialogHeader>
          <DialogDescription>
            Add a new course to the academic catalog
          </DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                placeholder="Data Structures & Algorithms"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  placeholder="CSE101"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  required
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value as string })}
                disabled={createMutation.isPending}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Select department (optional)" />
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
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Course description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={createMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Course'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateCourseDialog;
