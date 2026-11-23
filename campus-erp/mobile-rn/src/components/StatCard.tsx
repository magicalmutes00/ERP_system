import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {TrendingUp, TrendingDown} from 'lucide-react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  color: string;
  icon?: string;
}

export function StatCard({label, value, trend, color}: StatCardProps) {
  const positive = (trend ?? 0) >= 0;
  return (
    <LinearGradient
      colors={[color, color + 'DD']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend !== undefined && (
        <View style={styles.trend}>
          {positive ? <TrendingUp size={14} color="#FFFFFF" /> : <TrendingDown size={14} color="#FFFFFF" />}
          <Text style={styles.trendText}>
            {positive ? '+' : ''}
            {trend}%
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    padding: spacing.md,
    borderRadius: radius.lg,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  label: {color: '#FFFFFFCC', fontSize: fontSize.xs, fontWeight: fontWeight.medium},
  value: {color: '#FFFFFF', fontSize: fontSize.xxl, fontWeight: fontWeight.black, marginTop: spacing.xs},
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  trendText: {color: '#FFFFFF', fontSize: 10, fontWeight: fontWeight.bold},
});
