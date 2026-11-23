import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../store';
import {fetchInsights} from '../store/slices/dashboardSlice';
import {
  appleTheme,
  appleSpacing,
  appleRadius,
  appleTypography,
  appleShadow,
} from '../theme/apple';
import {AppleCard} from '../components/AppleCard';
import {AppleBadge} from '../components/AppleBadge';
import {AppleButton} from '../components/AppleButton';
import {TrendingUp, TrendingDown, Sparkles, Activity, Bell} from 'lucide-react-native';

interface StatItem {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
}

interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'destructive';
}

export function DashboardScreen() {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(s => s.auth);
  const {stats, recentActivity, isLoading, error} = useAppSelector(s => s.dashboard);

  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      dispatch(fetchInsights());
    }

    // Spring entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: appleTheme.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: appleTheme.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, user?.role]);

  const displayName =
    user?.student?.firstName ||
    user?.faculty?.firstName ||
    user?.admin?.firstName ||
    user?.email?.split('@')[0] ||
    'Admin';

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statColor = (label: string) => {
    const map: Record<string, string> = {
      'Total Students': appleTheme.colors.systemBlue,
      Faculty: appleTheme.colors.systemIndigo,
      'Active Courses': appleTheme.colors.systemPink,
      'Avg Attendance': appleTheme.colors.systemOrange,
      Revenue: appleTheme.colors.systemGreen,
      'AI Insights': appleTheme.colors.systemPurple,
    };
    return map[label] || appleTheme.colors.systemBlue;
  };

  const statList: StatItem[] = [
    {label: 'Total Students', value: '2,450', change: '+12%', trend: 'up'},
    {label: 'Faculty', value: '128', change: '+5%', trend: 'up'},
    {label: 'Active Courses', value: '64', change: '+8%', trend: 'up'},
    {label: 'Avg Attendance', value: '87%', change: '-2%', trend: 'down'},
    {label: 'Revenue', value: '₹84.2L', change: '+15%', trend: 'up'},
    {label: 'AI Insights', value: 'Active', change: 'Live', trend: 'up'},
  ];

  const activityList: ActivityItem[] = recentActivity || [
    {
      action: 'New student enrolled',
      detail: 'Rahul Sharma · B.Tech CSE',
      time: '2 min ago',
      type: 'info',
    },
    {
      action: 'Attendance marked',
      detail: 'Data Structures · 45/50 present',
      time: '15 min ago',
      type: 'success',
    },
    {
      action: 'Exam scheduled',
      detail: 'Mid-term exams for 4 courses',
      time: '1 hour ago',
      type: 'warning',
    },
    {
      action: 'Fee payment received',
      detail: '₹25,000 from Priya Patel',
      time: '2 hours ago',
      type: 'success',
    },
    {
      action: 'Low attendance alert',
      detail: '5 students below 75% in Mathematics',
      time: '3 hours ago',
      type: 'destructive',
    },
  ];

  const handleRefresh = () => {
    dispatch(fetchInsights());
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {opacity: opacityAnim, transform: [{scale: scaleAnim}]},
      ]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={appleTheme.colors.systemBlue}
          />
        }>
        {/* Hero section */}
        <View style={styles.hero}>
          <View style={styles.heroBadges}>
            <AppleBadge variant="default">
              <Sparkles size={12} color="#FFFFFF" /> AI-Powered
            </AppleBadge>
            <AppleBadge variant="success">
              <Activity size={12} color="#FFFFFF" /> Live
            </AppleBadge>
          </View>
          <Text style={styles.heroTitle}>
            {greeting}, {displayName}
          </Text>
          <Text style={styles.heroSubtitle}>
            You have 3 pending approvals and 5 new alerts today.
          </Text>
        </View>

        {error && (
          <AppleCard shadow="none" style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </AppleCard>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {statList.map((stat) => {
            const trendNum = parseInt(String(stat.change).replace(/[^-\d]/g, ''), 10) || 0;
            const isPositive = stat.trend === 'up';
            return (
              <AppleStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                color={statColor(stat.label)}
              />
            );
          })}
        </View>

        {/* Recent Activity section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <AppleButton
              title="View all"
              variant="ghost"
              style={styles.viewAllButton}
              onPress={handleRefresh}
            />
          </View>
          <View style={styles.activityList}>
            {activityList.map((activity, i) => (
              <AppleListItemRow
                key={i}
                title={activity.action}
                subtitle={activity.detail}
                time={activity.time}
                type={activity.type}
              />
            ))}
          </View>
        </View>

        {/* AI Insights section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <View style={styles.insightsGrid}>
            <AppleInsightCard
              type="warning"
              title="Attendance Warning"
              body="15 students have attendance below 75%. Consider sending automated alerts."
              iconColor="#F59E0B"
              bgColor="#FEF3C7"
            />
            <AppleInsightCard
              type="info"
              title="Performance Insight"
              body="CSE department shows 23% improvement this semester."
              iconColor="#0A84FF"
              bgColor="#DBEAFE"
            />
            <AppleInsightCard
              type="success"
              title="Recommendation"
              body="Add more practical sessions for Mathematics to boost engagement."
              iconColor="#30D158"
              bgColor="#D1FAE5"
            />
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appleTheme.colors.secondarySystemBackground,
  },
  content: {
    paddingBottom: appleTheme.spacing.huge,
  },
  statCard: {
    width: '48%',
    minHeight: 120,
    padding: appleTheme.spacing.lg,
    borderRadius: appleTheme.radius.xl,
    ...appleTheme.shadow.lg,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: appleTheme.typography.caption1.fontSize,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: appleTheme.typography.caption1.letterSpacing,
    marginBottom: appleTheme.spacing.sm,
  },
  statValue: {
    fontSize: appleTheme.typography.title2.fontSize,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: appleTheme.typography.title2.letterSpacing,
    marginBottom: appleTheme.spacing.md,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: appleTheme.radius.full,
    alignSelf: 'flex-start',
  },
  statTrendText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  insightCard: {
    flex: 1,
    minWidth: '48%',
    marginBottom: appleTheme.spacing.md,
  },
  hero: {
    paddingHorizontal: appleTheme.spacing.page,
    paddingTop: 10,
    paddingBottom: appleTheme.spacing.xxl,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: appleTheme.spacing.sm,
    marginBottom: appleTheme.spacing.lg,
  },
  heroTitle: {
    fontSize: appleTheme.typography.largeTitle.fontSize,
    fontWeight: appleTheme.typography.largeTitle.fontWeight,
    letterSpacing: appleTheme.typography.largeTitle.letterSpacing,
    color: appleTheme.colors.label,
    marginBottom: appleTheme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: appleTheme.typography.callout.fontSize,
    color: appleTheme.colors.secondaryLabel,
    letterSpacing: appleTheme.typography.callout.letterSpacing,
    lineHeight: appleTheme.typography.callout.lineHeight,
  },
  errorCard: {
    marginHorizontal: appleTheme.spacing.page,
    marginBottom: appleTheme.spacing.lg,
  },
  errorText: {
    fontSize: appleTheme.typography.footnote.fontSize,
    color: appleTheme.colors.systemRed,
    textAlign: 'center',
    padding: appleTheme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appleTheme.spacing.md,
    paddingHorizontal: appleTheme.spacing.page,
    marginTop: -appleTheme.spacing.xxl,
  },
  section: {
    paddingHorizontal: appleTheme.spacing.page,
    marginBottom: appleTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appleTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: appleTheme.typography.title3.fontSize,
    fontWeight: appleTheme.typography.title3.fontWeight,
    color: appleTheme.colors.label,
    letterSpacing: appleTheme.typography.title3.letterSpacing,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    height: 32,
  },
  activityList: {
    gap: appleTheme.spacing.sm,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appleTheme.spacing.md,
  },
});

interface AppleStatCardProps {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

function AppleStatCard({label, value, change, trend, color}: AppleStatCardProps) {
  const trendNum = parseInt(String(change).replace(/[^-\d]/g, ''), 10) || 0;
  const isPositive = trend === 'up';

  return (
    <View style={[styles.statCard, {backgroundColor: color}]}>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.statTrend}>
          {isPositive ? (
            <TrendingUp size={12} color="rgba(255,255,255,0.9)" />
          ) : (
            <TrendingDown size={12} color="rgba(255,255,255,0.9)" />
          )}
          <Text style={styles.statTrendText}>
            {isPositive ? '+' : ''}{trendNum}%
          </Text>
        </View>
      </View>
    </View>
  );
}

interface AppleListItemRowProps {
  title: string;
  subtitle: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'destructive';
}

const typeConfig: Record<string, {dot: string; bg: string}> = {
  info: {dot: appleTheme.colors.systemBlue, bg: '#DBEAFE'},
  success: {dot: appleTheme.colors.systemGreen, bg: '#D1FAE5'},
  warning: {dot: appleTheme.colors.systemOrange, bg: '#FEF3C7'},
  destructive: {dot: appleTheme.colors.systemRed, bg: '#FEE2E2'},
};

function AppleListItemRow({title, subtitle, time, type}: AppleListItemRowProps) {
  const config = typeConfig[type] || typeConfig.info;
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.dot, {backgroundColor: config.dot}]} />
      <View style={rowStyles.rowContent}>
        <Text style={rowStyles.rowTitle}>{title}</Text>
        <Text style={rowStyles.rowSubtitle}>{subtitle}</Text>
      </View>
      <View style={rowStyles.rowBadge}>
        <AppleBadge variant="default" style={rowStyles.badgeText}>
          {time}
        </AppleBadge>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appleTheme.colors.systemBackground,
    padding: appleTheme.spacing.md,
    borderRadius: appleTheme.radius.lg,
    gap: appleTheme.spacing.md,
    ...appleTheme.shadow.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: appleTheme.typography.body.fontSize,
    fontWeight: '500' as const,
    color: appleTheme.colors.label,
    letterSpacing: appleTheme.typography.body.letterSpacing,
  },
  rowSubtitle: {
    fontSize: appleTheme.typography.caption1.fontSize,
    color: appleTheme.colors.tertiaryLabel,
    marginTop: 2,
    letterSpacing: appleTheme.typography.caption1.letterSpacing,
  },
  rowBadge: {
    alignItems: 'flex-end',
  },
  badgeText: {
    fontSize: appleTheme.typography.caption2.fontSize,
    fontWeight: '600' as const,
    backgroundColor: '#F2F2F7',
    color: appleTheme.colors.secondaryLabel,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: appleTheme.radius.full,
  },
});

interface AppleInsightCardProps {
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  body: string;
  iconColor: string;
  bgColor: string;
}

function AppleInsightCard({
  type,
  title,
  body,
  iconColor,
  bgColor,
}: AppleInsightCardProps) {
  const iconMap: Record<string, any> = {
    info: <Bell size={20} color={iconColor} />,
    warning: <Bell size={20} color={iconColor} />,
    success: <Sparkles size={20} color={iconColor} />,
    danger: <Bell size={20} color={iconColor} />,
  };

  return (
    <AppleCard shadow="sm" style={styles.insightCard}>
      <View style={insightStyles.insightRow}>
        <View style={[insightStyles.iconWrap, {backgroundColor: bgColor}]}>
          {iconMap[type]}
        </View>
        <View style={insightStyles.insightInfo}>
          <Text style={insightStyles.insightTitle}>{title}</Text>
          <Text style={insightStyles.insightBody}>{body}</Text>
        </View>
      </View>
    </AppleCard>
  );
}

const insightStyles = StyleSheet.create({
  insightCard: {
    flex: 1,
    minWidth: '48%',
    marginBottom: appleTheme.spacing.md,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appleTheme.spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: appleTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: appleTheme.typography.headline.fontSize,
    fontWeight: '600' as const,
    color: appleTheme.colors.label,
    letterSpacing: appleTheme.typography.headline.letterSpacing,
    marginBottom: 4,
  },
  insightBody: {
    fontSize: appleTheme.typography.subhead.fontSize,
    color: appleTheme.colors.secondaryLabel,
    lineHeight: appleTheme.typography.subhead.lineHeight,
    letterSpacing: appleTheme.typography.subhead.letterSpacing,
  },
});
