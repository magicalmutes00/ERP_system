import {colors} from './colors';
import {spacing, radius, fontSize, fontWeight} from './spacing';

export const lightTheme = {
  colors: {
    ...colors,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
  },
  spacing,
  radius,
  fontSize,
  fontWeight,
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...colors,
    background: colors.dark.background,
    surface: colors.dark.surface,
    surfaceAlt: colors.dark.surfaceAlt,
    border: colors.dark.border,
    text: colors.dark.text,
    textSecondary: colors.dark.textSecondary,
    textMuted: colors.dark.textMuted,
  },
};

export type Theme = typeof lightTheme;
export {colors, spacing, radius, fontSize, fontWeight};
