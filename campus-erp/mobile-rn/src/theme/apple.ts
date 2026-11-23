/**
 * Apple Design System for React Native
 * 
 * Based on Apple's Human Interface Guidelines and WWDC design talks.
 * Key principles applied:
 * - Response: instant feedback on touch-down
 * - Direct manipulation: 1:1 tracking
 * - Interruptibility: spring animations
 * - Materials & depth: translucent layers with blur
 * - Typography: optical sizing, tracking, leading
 * - Multimodal feedback: haptics
 */

import {Platform} from 'react-native';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLORS — Apple System Palette
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const appleColors = {
  // System colors (light mode)
  systemBlue: '#0A84FF',
  systemGreen: '#30D158',
  systemRed: '#FF453A',
  systemOrange: '#FF9F0A',
  systemYellow: '#FFD60A',
  systemPurple: '#BF5AF2',
  systemPink: '#FF375F',
  systemTeal: '#64D2FE',
  systemMint: '#5AC8FA',
  systemIndigo: '#5E5CE6',

  // Backgrounds
  systemBackground: '#FFFFFF',
  systemBackgroundDark: '#000000',
  secondarySystemBackground: '#F2F2F7',
  secondarySystemBackgroundDark: '#1C1C1E',
  tertiarySystemBackground: '#FFFFFF',
  tertiarySystemBackgroundDark: '#2C2C2E',
  groupedSystemBackground: '#F2F2F7',
  groupedSystemBackgroundDark: '#000000',

  // Labels
  label: '#000000',
  labelDark: '#FFFFFF',
  secondaryLabel: '#3C3C43',
  secondaryLabelDark: '#EBEBF5',
  tertiaryLabel: '#8E8E93',
  tertiaryLabelDark: '#8E8E93',
  quaternaryLabel: '#C7C7CC',
  quaternaryLabelDark: '#38383A',

  // Separators
  separator: '#C6C6C8',
  separatorDark: '#38383A',
  opaqueSeparator: '#D1D1D6',
  opaqueSeparatorDark: '#38383A',

  // Links & tints
  link: '#0A84FF',
  linkDark: '#0A84FF',

  // Fill colors (for translucent overlays)
  systemFill: '#C7C7CC',
  systemFillDark: '#2C2C2E',
  secondarySystemFill: '#C7C7CC',
  tertiarySystemFill: '#C7C7CC',
  quaternarySystemFill: '#C7C7CC',

  // Dark mode variants
  dark: {
    systemBackground: '#000000',
    secondarySystemBackground: '#1C1C1E',
    tertiarySystemBackground: '#2C2C2E',
    groupedSystemBackground: '#000000',
    label: '#FFFFFF',
    secondaryLabel: '#EBEBF5',
    tertiaryLabel: '#8E8E93',
    quaternaryLabel: '#38383A',
    separator: '#38383A',
    opaqueSeparator: '#38383A',
    link: '#0A84FF',
    systemFill: '#2C2C2E',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPOGRAPHY — SF Pro style with optical sizing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const appleTypography = {
  // Display / Large Title
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.02,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.02,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.01,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.01,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.01,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 13,
  },
};

// System font selection
export const systemFont = Platform.select({
  ios: '-apple-system',
  android: 'sans-serif',
  default: 'System',
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPACING — Apple 8pt grid with generous padding
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const appleSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  page: 20, // standard page margin
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RADIUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const appleRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOTION — Spring configurations matching Apple's defaults
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Apple spring defaults:
// - Move / reposition: damping 1.0, response 0.4
// - Rotation: damping 0.8, response 0.4
// - Drawer / sheet: damping 0.8, response 0.3
export const appleMotion = {
  // Critically damped, no overshoot — default UI spring
  springDefault: {
    damping: 20,
    stiffness: 140,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
    useNativeDriver: true,
  },
  // Slightly bouncy for momentum interactions
  springBouncy: {
    damping: 15,
    stiffness: 160,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
    useNativeDriver: true,
  },
  // Sheet / modal — quick, slightly bouncy
  springSheet: {
    damping: 18,
    stiffness: 180,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
    useNativeDriver: true,
  },
  // Fast press feedback
  springPress: {
    damping: 25,
    stiffness: 200,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
    useNativeDriver: true,
  },
};

// Animation durations (for non-spring cases)
export const appleDuration = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ELEVATION / SHADOW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const appleShadow = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.20,
    shadowRadius: 4.0,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.22,
    shadowRadius: 8.0,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.25,
    shadowRadius: 16.0,
    elevation: 8,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPOSITE THEME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const appleTheme = {
  colors: appleColors,
  typography: appleTypography,
  spacing: appleSpacing,
  radius: appleRadius,
  motion: appleMotion,
  duration: appleDuration,
  shadow: appleShadow,
  systemFont,
};

export type AppleTheme = typeof appleTheme;
