import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {AlertTriangle, Info, CheckCircle2, XCircle} from 'lucide-react-native';

interface InsightCardProps {
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  body: string;
  onPress?: () => void;
}

const config: Record<InsightCardProps['type'], {icon: any; color: string; bg: string}> = {
  info: {icon: Info, color: colors.info, bg: '#DBEAFE'},
  warning: {icon: AlertTriangle, color: '#F59E0B', bg: '#FEF3C7'},
  success: {icon: CheckCircle2, color: colors.success, bg: '#D1FAE5'},
  danger: {icon: XCircle, color: colors.danger, bg: '#FEE2E2'},
};

export function InsightCard({type, title, body, onPress}: InsightCardProps) {
  const {icon: Icon, color, bg} = config[type];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, {backgroundColor: bg}]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  title: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  body: {fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 20},
});
