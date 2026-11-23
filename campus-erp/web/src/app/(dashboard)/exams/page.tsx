'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, FileText, Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'upcoming' | 'results';

export default function ExamsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const { data, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examsApi.getAll(),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => examsApi.publishResults(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Results published successfully');
    },
    onError: () => toast.error('Failed to publish results'),
  });

  const exams = data?.data?.data ?? data?.data ?? [];

  const getStatusBadge = (exam: any) => {
    const scheduledDate = new Date(exam.scheduledAt);
    const now = new Date();
    if (exam.isPublished) return <Badge variant="success">Published</Badge>;
    if (scheduledDate > now) return <Badge variant="secondary">Scheduled</Badge>;
    if (scheduledDate.toDateString() === now.toDateString()) return <Badge variant="warning">Today</Badge>;
    return <Badge variant="destructive">Overdue</Badge>;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load exams.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage exams, schedules, and results</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Exam
        </Button>
      </div>

      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Upcoming Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Results
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-5 bg-muted rounded animate-pulse mb-3 w-1/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exams found</p>
            </div>
          </CardContent>
        </Card>
      ) : activeTab === 'upcoming' ? (
        <div className="space-y-3">
          {exams.map((exam: any) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{exam.title}</h3>
                      {getStatusBadge(exam)}
                    </div>
                    <p className="text-sm text-muted-foreground">{exam.course?.name || exam.courseId}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(exam.scheduledAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {exam.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {!exam.isPublished && (
                      <Button
                        size="sm"
                        onClick={() => publishMutation.mutate(exam.id)}
                        disabled={publishMutation.isPending}
                      >
                        {publishMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Publish Results
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {exams.filter((e: any) => e.isPublished).length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results published yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            exams.filter((e: any) => e.isPublished).map((exam: any) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{exam.title}</h3>
                        <Badge variant="success">Published</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{exam.course?.name || exam.courseId}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total Marks: {exam.totalMarks} | Type: {exam.type}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
