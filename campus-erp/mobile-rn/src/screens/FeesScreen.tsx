import React from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {feesApi} from '../api';
import {useQuery} from '@tanstack/react-query';
import {DollarSign, CheckCircle2, Clock} from 'lucide-react-native';

export function FeesScreen() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['fees'],
    queryFn: () => feesApi.getAll(),
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
        <Text style={{color: colors.danger, fontSize: fontSize.md}}>Failed to load fees</Text>
      </View>
    );
  }

  const fees = data?.data?.data ?? data?.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fees</Text>
        <View style={styles.totals}>
          <View style={[styles.totalCard, {backgroundColor: '#10B981'}]}>
            <CheckCircle2 size={18} color="#FFFFFF" />
            <Text style={styles.totalValue}>$5,200</Text>
            <Text style={styles.totalLabel}>Paid</Text>
          </View>
          <View style={[styles.totalCard, {backgroundColor: '#EF4444'}]}>
            <Clock size={18} color="#FFFFFF" />
            <Text style={styles.totalValue}>$1,500</Text>
            <Text style={styles.totalLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={fees}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}: any) => (
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <DollarSign size={20} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.title ?? item.type ?? 'Fee'}</Text>
              <Text style={styles.detail}>Due: {item.dueDate ?? 'TBD'}</Text>
            </View>
            <Text style={styles.amount}>${item.amount ?? 0}</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.status === 'PAID' ? '#10B981' : item.status === 'OVERDUE' ? '#EF4444' : '#F59E0B',
                },
              ]}>
              <Text style={styles.badgeText}>{item.status ?? 'PENDING'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No fees</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {padding: spacing.lg},
  title: {fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md},
  totals: {flexDirection: 'row', gap: spacing.md},
  totalCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 4,
  },
  totalValue: {color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: fontWeight.bold},
  totalLabel: {color: '#FFFFFFCC', fontSize: fontSize.xs},
  list: {paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {flex: 1},
  name: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  detail: {fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2},
  amount: {fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text},
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {color: '#FFFFFF', fontSize: 10, fontWeight: fontWeight.bold},
  empty: {textAlign: 'center', color: colors.textMuted, padding: spacing.xxl},
});
