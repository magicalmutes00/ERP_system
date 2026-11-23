/**
 * AppleNavBar — Translucent top navigation bar
 * 
 * Apple Design principles:
 * - Materials & depth: translucent layer, content scrolls underneath
 * - Spatial consistency: back button on left, title center, actions right
 * - Familiarity: standard iOS navigation bar pattern
 */

import React from 'react';
import {Animated, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {appleTheme} from '../theme/apple';

interface AppleNavBarProps {
  title: string;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
  rightOnPress?: () => void;
  style?: ViewStyle;
}

export function AppleNavBar({
  title,
  onBack,
  rightIcon,
  rightOnPress,
  style,
}: AppleNavBarProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {onBack && (
          <View style={styles.backWrapper}>
            <Text style={styles.backText}>‹</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        {rightIcon && rightOnPress && (
          <View style={styles.rightWrapper}>{rightIcon}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1 / 3,
    borderBottomColor: appleTheme.colors.separator,
    ...appleTheme.shadow.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: appleTheme.spacing.page,
  },
  backWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 17,
    color: appleTheme.colors.systemBlue,
    fontWeight: '500' as const,
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: appleTheme.colors.label,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.01,
  },
  rightWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
