/**
 * AppleListItem — Settings/list row with 1:1 touch tracking
 * 
 * Apple Design principles:
 * - Direct manipulation: 1:1 press tracking
 * - Familiarity: chevron on right indicates navigation
 * - Craft: precise spacing, icon alignment
 * - Spatial consistency: icon left, text center, chevron right
 */

import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {appleTheme} from '../theme/apple';

interface AppleListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  style?: ViewStyle;
}

export function AppleListItem({
  title,
  subtitle,
  icon,
  onPress,
  chevron = false,
  destructive = false,
  style,
}: AppleListItemProps) {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      ...appleTheme.motion.springPress,
      toValue: 0.97,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      ...appleTheme.motion.springPress,
      toValue: 1,
    }).start();
  };

  const titleColor = destructive
    ? appleTheme.colors.systemRed
    : appleTheme.colors.label;

  return (
    <Animated.View style={[style, {transform: [{scale: scaleAnim}]}]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.container}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={[styles.title, {color: titleColor}]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {chevron && (
          <View style={styles.chevronWrapper}>
            <Text style={styles.chevron}>›</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: appleTheme.spacing.page,
    paddingVertical: appleTheme.spacing.md,
    backgroundColor: appleTheme.colors.secondarySystemBackground,
    borderRadius: appleTheme.radius.md,
    marginHorizontal: appleTheme.spacing.page,
    marginVertical: 4,
    minHeight: 56,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: appleTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: appleTheme.spacing.md,
    backgroundColor: appleTheme.colors.tertiarySystemFill,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: appleTheme.typography.body.fontSize,
    fontWeight: '500' as const,
    letterSpacing: appleTheme.typography.body.letterSpacing,
    color: appleTheme.colors.label,
  },
  subtitle: {
    fontSize: appleTheme.typography.caption1.fontSize,
    color: appleTheme.colors.tertiaryLabel,
    marginTop: 2,
  },
  chevronWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 14,
    color: appleTheme.colors.quaternaryLabel,
    fontWeight: '500' as const,
  },
});
