export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

export interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'destructive';
}
