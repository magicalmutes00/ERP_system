/**
 * AppleBadge — Pill-shaped status badge
 * 
 * Apple Design principles:
 * - Simplicity: minimal, clear
 * - Craft: precise corner radius, typography
 * - Familiarity: standard iOS badge pattern
 */

import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {appleTheme} from '../theme/apple';

interface AppleBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<string, {bg: string; text: string}> = {
  default: {bg: appleTheme.colors.tertiarySystemFill, text: appleTheme.colors.label},
  success: {bg: '#D1FAE5', text: '#15803D'},
  warning: {bg: '#FEF3C7', text: '#92400E'},
  danger: {bg: '#FEE2E2', text: '#991B1B'},
  info: {bg: '#DBEAFE', text: '#1E40AF'},
};

export function AppleBadge({
  children,
  variant = 'default',
  style,
}: AppleBadgeProps) {
  const {bg, text} = VARIANT_COLORS[variant];

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: bg},
        style,
      ]}>
      <Text style={[styles.text, {color: text}]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: appleTheme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: appleTheme.typography.caption2.fontSize,
    fontWeight: '600' as const,
    letterSpacing: appleTheme.typography.caption2.letterSpacing,
  },
});
