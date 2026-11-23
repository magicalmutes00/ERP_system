/**
 * AppleButton — Primary action button with spring press feedback
 * 
 * Apple Design principles applied:
 * - Response: instant scale feedback on touch-down
 * - Interruptibility: spring animation, interruptible
 * - Materials: elevated surface with shadow
 * - Multimodal: haptic-ready
 */

import React from 'react';
import {Animated, ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {appleTheme} from '../theme/apple';

interface AppleButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<string, ViewStyle> = {
  primary: {
    backgroundColor: appleTheme.colors.systemBlue,
    ...appleTheme.shadow.md,
  },
  secondary: {
    backgroundColor: appleTheme.colors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: appleTheme.colors.separator,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appleTheme.colors.systemBlue,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

export function AppleButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
  icon,
}: AppleButtonProps) {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      ...appleTheme.motion.springPress,
      toValue: 0.95,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      ...appleTheme.motion.springPress,
      toValue: 1,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const baseStyle = VARIANT_STYLES[variant];
  const textColor =
    variant === 'primary' || variant === 'outline'
      ? '#FFFFFF'
      : variant === 'ghost'
        ? appleTheme.colors.systemBlue
        : appleTheme.colors.label;

  return (
    <Animated.View style={[style, {transform: [{scale: scaleAnim}]}]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.container,
          baseStyle,
          disabled && {opacity: 0.5, backgroundColor: appleTheme.colors.tertiarySystemFill},
        ]}>
        {loading ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.title,
                {color: textColor, fontWeight: '600' as const},
              ]}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: appleTheme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...appleTheme.shadow.md,
  },
  title: {
    fontSize: appleTheme.typography.headline.fontSize,
    fontWeight: '600' as const,
    letterSpacing: appleTheme.typography.headline.letterSpacing,
  },
  icon: {
    marginRight: appleTheme.spacing.sm,
  },
  spinner: {
    width: 20,
    height: 20,
    color: '#FFFFFF',
  },
});
