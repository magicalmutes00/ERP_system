import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {useAppDispatch, useAppSelector} from '../store';
import {logout} from '../store/slices/authSlice';
import {
  CalendarCheck,
  FileText,
  ClipboardList,
  DollarSign,
  Bell,
  MessageSquare,
  Brain,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

const items = [
  {label: 'Attendance', icon: CalendarCheck, route: 'Attendance' as const, color: '#10B981'},
  {label: 'Exams', icon: FileText, route: 'Exams' as const, color: '#F59E0B'},
  {label: 'Assignments', icon: ClipboardList, route: 'Assignments' as const, color: '#EC4899'},
  {label: 'Fees', icon: DollarSign, route: 'Fees' as const, color: '#EF4444'},
  {label: 'Notifications', icon: Bell, route: 'Notifications' as const, color: '#06B6D4'},
  {label: 'Messages', icon: MessageSquare, route: 'Chat' as const, color: '#3B82F6'},
  {label: 'AI Insights', icon: Brain, route: 'AI' as const, color: '#8B5CF6'},
  {label: 'Settings', icon: Settings, route: 'Settings' as const, color: '#6B7280'},
];

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(s => s.auth);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </Text>
        </View>
        <View>
          <Text style={styles.name}>
            {user?.student?.firstName || user?.faculty?.firstName || user?.admin?.firstName || 'User'}{' '}
            {user?.student?.lastName || user?.faculty?.lastName || user?.admin?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {items.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={() => navigation.navigate(item.route)}>
            <View style={[styles.iconWrap, {backgroundColor: item.color}]}>
              <item.icon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={() => dispatch(logout())}>
        <LogOut size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: '#FFFFFF', fontSize: fontSize.xxl, fontWeight: fontWeight.bold},
  name: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  email: {fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2},
  role: {fontSize: fontSize.xs, color: colors.primary, marginTop: 2, fontWeight: fontWeight.semibold},
  list: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium},
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {color: colors.danger, fontWeight: fontWeight.semibold},
});
