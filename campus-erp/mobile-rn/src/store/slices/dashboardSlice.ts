import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {aiApi} from '../../api';
import {DashboardStat, ActivityItem} from '../../types/dashboard';

interface DashboardState {
  stats: DashboardStat[];
  recentActivity: ActivityItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: [
    {label: 'Total Students', value: '2,450', change: '+12%', trend: 'up', icon: 'users'},
    {label: 'Faculty', value: '128', change: '+5%', trend: 'up', icon: 'graduation-cap'},
    {label: 'Active Courses', value: '64', change: '+8%', trend: 'up', icon: 'book-open'},
    {label: 'Avg Attendance', value: '87%', change: '-2%', trend: 'down', icon: 'calendar-check'},
    {label: 'Revenue', value: '₹84.2L', change: '+15%', trend: 'up', icon: 'dollar-sign'},
    {label: 'AI Insights', value: 'Active', change: 'Real-time', trend: 'up', icon: 'brain'},
  ],
  recentActivity: [
    {action: 'New student enrolled', detail: 'Rahul Sharma - B.Tech CSE', time: '2 min ago', type: 'info'},
    {action: 'Attendance marked', detail: 'Data Structures - 45/50 present', time: '15 min ago', type: 'success'},
    {action: 'Exam scheduled', detail: 'Mid-term exams for 4 courses', time: '1 hour ago', type: 'warning'},
    {action: 'Fee payment received', detail: '₹25,000 from Priya Patel', time: '2 hours ago', type: 'success'},
    {action: 'Low attendance alert', detail: '5 students below 75% in Mathematics', time: '3 hours ago', type: 'destructive'},
  ],
  isLoading: false,
  error: null,
};

export const fetchInsights = createAsyncThunk(
  'dashboard/fetchInsights',
  async (_, {rejectWithValue}) => {
    try {
      const response = await aiApi.getInsights();
      const data = response.data.data ?? response.data;
      return {
        stats: [
          {label: 'Attendance Prediction', value: `${data.attendancePrediction?.predicted ?? '—'}%`, change: `${data.attendancePrediction?.trend ?? '0'}%`, trend: (data.attendancePrediction?.trend ?? 0) >= 0 ? 'up' as const : 'down' as const, icon: 'calendar-check'},
          {label: 'At-Risk Students', value: String(data.atRiskStudents?.count ?? 0), change: `-${data.atRiskStudents?.change ?? 0}%`, trend: 'down' as const, icon: 'alert-triangle'},
          {label: 'Avg Performance', value: `${data.performanceInsights?.average ?? '—'}%`, change: `${data.performanceInsights?.improvement ?? '0'}%`, trend: (data.performanceInsights?.improvement ?? 0) >= 0 ? 'up' as const : 'down' as const, icon: 'trending-up'},
        ],
        recentActivity: (data.atRiskStudents?.students ?? []).map((s: any, i: number) => ({
          action: 'At-risk student detected',
          detail: `${s.name} — ${s.reason}`,
          time: `${i + 1} hour ago`,
          type: 'destructive' as const,
        })),
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch insights',
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchInsights.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentActivity = action.payload.recentActivity;
        state.error = null;
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? 'Failed';
      });
  },
});

export default dashboardSlice.reducer;
