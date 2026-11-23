import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator, FlatList} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {examsApi} from '../api';
import {useQuery} from '@tanstack/react-query';
import {FileText, Clock} from 'lucide-react-native';

export function ExamsScreen() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['exams'],
    queryFn: () => examsApi.getAll(),
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
        <Text style={{color: colors.danger, fontSize: fontSize.md}}>Failed to load exams</Text>
      </View>
    );
  }

  const exams = data?.data?.data ?? data?.data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exams</Text>
      <FlatList
        data={exams}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}: any) => (
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <FileText size={20} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.meta}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={styles.date}>
                  {item.startDate ?? 'TBD'} • {item.totalMarks ?? 100} marks
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming exams</Text>}
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
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {flex: 1},
  name: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  meta: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  date: {fontSize: fontSize.xs, color: colors.textMuted},
  empty: {textAlign: 'center', color: colors.textMuted, padding: spacing.xxl},
});
