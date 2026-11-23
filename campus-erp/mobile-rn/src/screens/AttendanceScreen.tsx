import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator, FlatList} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {attendanceApi} from '../api';
import {useQuery} from '@tanstack/react-query';
import {CheckCircle2, XCircle, Clock} from 'lucide-react-native';

export function AttendanceScreen() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceApi.getAll(),
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
        <Text style={{color: colors.danger, fontSize: fontSize.md}}>Failed to load attendance</Text>
      </View>
    );
  }

  const records = data?.data?.data ?? data?.data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Attendance</Text>
      <View style={styles.summary}>
        <View style={[styles.summaryCard, {backgroundColor: '#10B981'}]}>
          <CheckCircle2 size={24} color="#FFFFFF" />
          <Text style={styles.summaryValue}>92%</Text>
          <Text style={styles.summaryLabel}>Overall</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#F59E0B'}]}>
          <Clock size={24} color="#FFFFFF" />
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
        <View style={[styles.summaryCard, {backgroundColor: '#EF4444'}]}>
          <XCircle size={24} color="#FFFFFF" />
          <Text style={styles.summaryValue}>1</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item: any, i) => item.id ?? String(i)}
        contentContainerStyle={styles.list}
        renderItem={({item}: any) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.courseName ?? item.course?.name ?? 'Course'}</Text>
              <Text style={styles.date}>{item.date ?? 'Today'}</Text>
            </View>
            <View
              style={[
                styles.status,
                {
                  backgroundColor:
                    item.status === 'PRESENT'
                      ? '#10B981'
                      : item.status === 'ABSENT'
                      ? '#EF4444'
                      : '#F59E0B',
                },
              ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No attendance records</Text>}
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
  summary: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {color: '#FFFFFF', fontSize: fontSize.xl, fontWeight: fontWeight.bold},
  summaryLabel: {color: '#FFFFFFCC', fontSize: fontSize.xs},
  list: {padding: spacing.lg, gap: spacing.sm},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  info: {flex: 1},
  name: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  date: {fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2},
  status: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusText: {color: '#FFFFFF', fontSize: fontSize.xs, fontWeight: fontWeight.semibold},
  empty: {textAlign: 'center', color: colors.textMuted, padding: spacing.xxl},
});
