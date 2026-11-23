/**
 * AppleInput — Text input with Apple styling
 * 
 * Apple Design principles:
 * - Craft: precise border radius, padding, font
 * - Familiarity: standard iOS text field pattern
 * - Reduced motion: respects preferences
 */

import React from 'react';
import {StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle} from 'react-native';
import {appleTheme} from '../theme/apple';

interface AppleInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export function AppleInput({
  label,
  error,
  secureTextEntry = false,
  style,
  containerStyle,
  ...props
}: AppleInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && {borderColor: appleTheme.colors.systemRed},
          style,
        ]}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: appleTheme.spacing.lg,
  },
  label: {
    fontSize: appleTheme.typography.subhead.fontSize,
    fontWeight: '500' as const,
    color: appleTheme.colors.secondaryLabel,
    marginBottom: appleTheme.spacing.sm,
    letterSpacing: appleTheme.typography.subhead.letterSpacing,
  },
  input: {
    height: 52,
    paddingHorizontal: appleTheme.spacing.md,
    borderWidth: 1,
    borderColor: appleTheme.colors.separator,
    borderRadius: appleTheme.radius.lg,
    backgroundColor: appleTheme.colors.systemBackground,
    color: appleTheme.colors.label,
    fontSize: appleTheme.typography.body.fontSize,
    ...appleTheme.shadow.sm,
  },
  errorText: {
    fontSize: appleTheme.typography.caption2.fontSize,
    color: appleTheme.colors.systemRed,
    marginTop: appleTheme.spacing.xs,
    letterSpacing: appleTheme.typography.caption2.letterSpacing,
  },
});
