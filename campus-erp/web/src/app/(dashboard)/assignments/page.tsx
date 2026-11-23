'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FileText, Clock, Calendar, Download } from 'lucide-react';

const assignments = [
  { id: '1', title: 'Data Structures - Linked Lists', course: 'CS201', dueDate: '2024-03-15', submissions: 32, total: 45, status: 'Active' },
  { id: '2', title: 'Algorithm Analysis', course: 'CS301', dueDate: '2024-03-20', submissions: 28, total: 40, status: 'Active' },
  { id: '3', title: 'Database Design Project', course: 'CS401', dueDate: '2024-03-10', submissions: 38, total: 38, status: 'Closed' },
];

export default function AssignmentsPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Manage course assignments and submissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>Track and manage assignments across courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assignments..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium">Submissions</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{a.title}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm">{a.course}</td>
                    <td className="py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {a.dueDate}
                      </div>
                    </td>
                    <td className="py-3 text-sm">{a.submissions}/{a.total}</td>
                    <td className="py-3">
                      <Badge variant={a.status === 'Active' ? 'success' : 'secondary'}>{a.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
