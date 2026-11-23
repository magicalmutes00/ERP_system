'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCheck, Megaphone, Trash2, Loader2, Info, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'notifications' | 'announcements';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('notifications');

  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMyNotifications(),
  });

  const { data: announceData, isLoading: announceLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => notificationsApi.getAnnouncements(),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const notifications = notifData?.data?.data ?? notifData?.data ?? [];
  const announcements = announceData?.data?.data ?? announceData?.data ?? [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'INFO':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with campus announcements and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'announcements'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            Announcements
          </button>
        </div>
      </div>

      {activeTab === 'notifications' ? (
        notifLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any) => (
              <Card
                key={notif.id}
                className={`transition-colors ${!notif.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getTypeIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold' : ''}`}>{notif.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notif.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => markReadMutation.mutate(notif.id)}
                            >
                              <CheckCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => deleteMutation.mutate(notif.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(notif.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        announceLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No announcements yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement: any) => (
              <Card key={announcement.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground mt-2">{announcement.message}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(announcement.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
