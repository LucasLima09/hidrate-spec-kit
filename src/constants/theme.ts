/**
 * Hidrate design tokens. The app is intentionally light-only, built around a
 * calm green palette with soft surfaces and high-contrast typography.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#10261D',
    textSecondary: '#5C7268',
    textTertiary: '#8A9C93',
    background: '#F4FAF6',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FCF9',
    backgroundElement: '#E9F5ED',
    backgroundSelected: '#D5EDDF',
    border: '#DCEBE2',
    borderStrong: '#C4DDD0',
    accent: '#1B7A55',
    accentDark: '#10583C',
    accentSoft: '#CDEBDD',
    accentMuted: '#82BFA4',
    accentBright: '#8BE7B9',
    onAccent: '#FFFFFF',
    success: '#247A53',
    successSoft: '#E2F4EA',
    warning: '#8A5A00',
    warningSoft: '#FBF3E2',
    danger: '#B34842',
    dangerSoft: '#FBEDEC',
    overlay: 'rgba(9, 31, 22, 0.48)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Radius = {
  small: 12,
  medium: 16,
  large: 22,
  xlarge: 28,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 104 }) ?? 80;
export const MaxContentWidth = 720;
