import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';

interface ActivityRowProps {
  title: string;
  subtitle?: string;
  time: string;
  type: 'enrollment' | 'assignment' | 'attendance' | 'exam' | 'other';
  onPress?: () => void;
}

const typeColor: Record<ActivityRowProps['type'], string> = {
  enrollment: colors.info,
  assignment: colors.warning,
  attendance: colors.success,
  exam: colors.danger,
  other: colors.textMuted,
};

export function ActivityRow({title, subtitle, time, type, onPress}: ActivityRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.dot, {backgroundColor: typeColor[type]}]} />
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.time}>{time}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  dot: {width: 10, height: 10, borderRadius: 5},
  info: {flex: 1},
  title: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  subtitle: {fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2},
  time: {fontSize: fontSize.xs, color: colors.textMuted},
});
