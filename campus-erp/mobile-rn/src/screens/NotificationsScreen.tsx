import React from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {notificationsApi} from '../api';
import {useQuery} from '@tanstack/react-query';
import {Bell, Info, AlertTriangle, CheckCircle2} from 'lucide-react-native';

export function NotificationsScreen() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{color: colors.danger, fontSize: fontSize.md}}>Failed to load notifications</Text>
      </View>
    );
  }

  const items = data?.data?.data ?? data?.data ?? [];

  const getIcon = (type: string) => {
    if (type === 'WARNING' || type === 'ALERT') return AlertTriangle;
    if (type === 'SUCCESS') return CheckCircle2;
    return Info;
  };

  const getColor = (type: string) => {
    if (type === 'WARNING' || type === 'ALERT') return '#F59E0B';
    if (type === 'SUCCESS') return '#10B981';
    return colors.info;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}: any) => {
          const Icon = getIcon(item.type);
          const color = getColor(item.type);
          return (
            <View style={styles.row}>
              <View style={[styles.iconWrap, {backgroundColor: color}]}>
                <Icon size={20} color="#FFFFFF" />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.createdAt ?? 'Just now'}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    padding: spacing.lg,
  },
  list: {padding: spacing.lg, gap: spacing.md},
  row: {
    flexDirection: 'row',
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
  info: {flex: 1},
  name: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  body: {fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 20},
  time: {fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4},
  empty: {alignItems: 'center', padding: spacing.huge, gap: spacing.md},
  emptyText: {color: colors.textMuted, fontSize: fontSize.md},
});
