/**
 * AppleCard — Translucent material card with subtle shadow
 * 
 * Apple Design principles:
 * - Materials & depth: translucent surface, soft shadow
 * - Craft: deliberate spacing, corner radius
 * - Simplicity: clean, uncluttered surface
 */

import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {appleTheme} from '../theme/apple';

interface AppleCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AppleCard({children, style, padding = 16, shadow = 'md'}: AppleCardProps) {
  return (
    <View
      style={[
        styles.container,
        padding > 0 && {padding},
        appleTheme.shadow[shadow],
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appleTheme.colors.secondarySystemBackground,
    borderRadius: appleTheme.radius.lg,
    borderWidth: 1,
    borderColor: appleTheme.colors.separator,
  },
});
