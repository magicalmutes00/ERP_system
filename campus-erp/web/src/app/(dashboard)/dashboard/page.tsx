'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Users, GraduationCap, BookOpen, CalendarCheck, DollarSign,
  TrendingUp, AlertTriangle, Brain, ArrowUpRight, ArrowDownRight,
  Sparkles, Activity, Clock, ArrowRight, Plus, FileBarChart,
  Bell, MessageSquare,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { studentsApi, facultyApi, coursesApi, attendanceApi, feesApi, notificationsApi, aiApi } from '@/lib/api';
import { toast } from 'sonner';

const statConfig: Record<string, { icon: any; gradient: string; bg: string }> = {
  'Total Students': { icon: Users, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  Faculty: { icon: GraduationCap, gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/40' },
  'Active Courses': { icon: BookOpen, gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-950/40' },
  'Avg Attendance': { icon: CalendarCheck, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  Revenue: { icon: DollarSign, gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  'AI Insights': { icon: Brain, gradient: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const displayName =
    user?.student?.firstName || user?.faculty?.firstName || user?.admin?.firstName || user?.email?.split('@')[0] || 'Admin';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['dashboard-students', refreshKey],
    queryFn: () => studentsApi.getAll({ limit: 1 }),
  });

  const { data: facultyData, isLoading: facultyLoading } = useQuery({
    queryKey: ['dashboard-faculty', refreshKey],
    queryFn: () => facultyApi.getAll({ limit: 1 }),
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['dashboard-courses', refreshKey],
    queryFn: () => coursesApi.getAll({ limit: 1 }),
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['dashboard-notifications', refreshKey],
    queryFn: () => notificationsApi.getMyNotifications({ limit: 10 }),
  });

  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['dashboard-insights', refreshKey],
    queryFn: () => aiApi.getInsights(),
  });

  const totalStudents = studentsData?.data?.data?.total ?? studentsData?.data?.total ?? 0;
  const totalFaculty = facultyData?.data?.data?.total ?? facultyData?.data?.total ?? 0;
  const totalCourses = coursesData?.data?.data?.total ?? coursesData?.data?.total ?? 0;

  const recentActivity = (notificationsData?.data?.data ?? notificationsData?.data ?? []).map((n: any) => ({
    action: n.title,
    detail: n.message,
    time: n.createdAt ? new Date(n.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    type: n.type?.toLowerCase() === 'warning' ? 'warning' : n.type?.toLowerCase() === 'alert' ? 'destructive' : 'info',
  }));

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-pink-400/20 blur-3xl" />
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-emerald-500/30 text-white border-0 backdrop-blur">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {greeting}, {displayName} 👋
              </h1>
              <p className="text-white/80 max-w-xl">
                Here&apos;s what&apos;s happening across your campus today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-white text-indigo-700 hover:bg-white/90" onClick={handleRefresh}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link href="/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Students', value: totalStudents, trend: '+12%', trendType: 'up' as const },
          { label: 'Faculty', value: totalFaculty, trend: '+5%', trendType: 'up' as const },
          { label: 'Active Courses', value: totalCourses, trend: '+8%', trendType: 'up' as const },
          { label: 'Avg Attendance', value: '87%', trend: '-2%', trendType: 'down' as const },
          { label: 'Revenue', value: '₹84.2L', trend: '+15%', trendType: 'up' as const },
          { label: 'AI Insights', value: 'Active', trend: 'Real-time', trendType: 'up' as const },
        ].map((stat) => {
          const config = statConfig[stat.label];
          return (
            <Card
              key={stat.label}
              className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br', config.gradient)} />
              <div className={cn('absolute inset-0 opacity-10 bg-gradient-to-br', config.gradient)} />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md', config.gradient)}>
                  <config.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.trendType === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-rose-500 mr-1" />
                  )}
                  <span className={stat.trendType === 'up' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                    {stat.trend}
                  </span>
                  <span className="ml-1 text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Attendance Trend
              </CardTitle>
              <CardDescription>Monthly attendance vs target</CardDescription>
            </div>
            <Badge variant="secondary">Last 7 months</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={[{ month: 'Jan', attendance: 82, target: 85 }, { month: 'Feb', attendance: 84, target: 85 }, { month: 'Mar', attendance: 79, target: 85 }, { month: 'Apr', attendance: 87, target: 85 }, { month: 'May', attendance: 88, target: 85 }, { month: 'Jun', attendance: 91, target: 85 }, { month: 'Jul', attendance: 87, target: 85 }]}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="url(#targetGrad)" />
                <Area type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={3} fill="url(#attendanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Students by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'CSE', value: 850, color: '#6366f1' },
                    { name: 'ECE', value: 620, color: '#8b5cf6' },
                    { name: 'ME', value: 480, color: '#ec4899' },
                    { name: 'CE', value: 320, color: '#f59e0b' },
                    { name: 'EE', value: 180, color: '#10b981' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {[
                    { name: 'CSE', value: 850, color: '#6366f1' },
                    { name: 'ECE', value: 620, color: '#8b5cf6' },
                    { name: 'ME', value: 480, color: '#ec4899' },
                    { name: 'CE', value: 320, color: '#f59e0b' },
                    { name: 'EE', value: 180, color: '#10b981' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest notifications from your campus</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notifications">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationsLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50">
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm',
                        activity.type === 'info' && 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white',
                        activity.type === 'success' && 'bg-gradient-to-br from-emerald-500 to-green-500 text-white',
                        activity.type === 'warning' && 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
                        activity.type === 'destructive' && 'bg-gradient-to-br from-rose-500 to-red-500 text-white',
                      )}>
                        {activity.type === 'info' && <Users className="h-4 w-4" />}
                        {activity.type === 'success' && <CalendarCheck className="h-4 w-4" />}
                        {activity.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {activity.type === 'destructive' && <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{activity.action}</p>
                        <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-0 shadow-sm bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/30 dark:via-background dark:to-purple-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                <Brain className="h-4 w-4" />
              </div>
              AI Insights
            </CardTitle>
            <CardDescription>Smart recommendations for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insightsLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Attendance Warning</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                        15 students have attendance below 75%. Consider sending automated alerts.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Performance Insight</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                        CSE department shows 23% improvement this semester.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-emerald-950/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Recommendation</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Add more practical sessions for Mathematics to boost engagement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Collected vs pending fees (₹ Lakhs)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { month: 'Jan', collected: 12, pending: 8 },
              { month: 'Feb', collected: 18, pending: 6 },
              { month: 'Mar', collected: 22, pending: 9 },
              { month: 'Apr', collected: 15, pending: 5 },
              { month: 'May', collected: 28, pending: 7 },
              { month: 'Jun', collected: 32, pending: 4 },
            ]}>
              <defs>
                <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="collected" fill="url(#collectedGrad)" radius={[8, 8, 0, 0]} name="Collected" />
              <Bar dataKey="pending" fill="url(#pendingGrad)" radius={[8, 8, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Add Student', href: '/students', icon: Plus, color: 'from-blue-500 to-cyan-500' },
              { label: 'Mark Attendance', href: '/attendance', icon: CalendarCheck, color: 'from-emerald-500 to-green-500' },
              { label: 'Schedule Exam', href: '/exams', icon: FileBarChart, color: 'from-amber-500 to-orange-500' },
              { label: 'Send Notice', href: '/notifications', icon: Bell, color: 'from-pink-500 to-rose-500' },
              { label: 'AI Chat', href: '/ai', icon: Brain, color: 'from-violet-500 to-purple-500' },
              { label: 'Messages', href: '/chat', icon: MessageSquare, color: 'from-indigo-500 to-blue-500' },
            ].map((action) => (
              <Button
                key={action.label}
                asChild
                variant="outline"
                className="group h-auto flex-col gap-2 p-4 hover:border-transparent hover:shadow-md transition-all"
              >
                <Link href={action.href}>
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md group-hover:scale-110 transition-transform', action.color)}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
