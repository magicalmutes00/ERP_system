import React from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {assignmentsApi} from '../api';
import {useQuery} from '@tanstack/react-query';
import {ClipboardList, Calendar} from 'lucide-react-native';

export function AssignmentsScreen() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsApi.getAll(),
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
        <Text style={{color: colors.danger, fontSize: fontSize.md}}>Failed to load assignments</Text>
      </View>
    );
  }

  const items = data?.data?.data ?? data?.data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assignments</Text>
      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}: any) => (
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <ClipboardList size={20} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.title}</Text>
              <View style={styles.meta}>
                <Calendar size={12} color={colors.danger} />
                <Text style={styles.due}>
                  Due: {item.dueDate ?? 'TBD'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.priority,
                {
                  backgroundColor:
                    item.priority === 'HIGH'
                      ? colors.danger
                      : item.priority === 'MEDIUM'
                      ? '#F59E0B'
                      : '#10B981',
                },
              ]}>
              <Text style={styles.priorityText}>{item.priority ?? 'NORMAL'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No assignments</Text>}
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
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {flex: 1},
  name: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  meta: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  due: {fontSize: fontSize.xs, color: colors.danger},
  priority: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  priorityText: {color: '#FFFFFF', fontSize: 10, fontWeight: fontWeight.bold},
  empty: {textAlign: 'center', color: colors.textMuted, padding: spacing.xxl},
});
