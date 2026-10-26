import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'display'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'overline'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: 700,
    letterSpacing: 0.1,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  display: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: 700,
    letterSpacing: -2,
  },
  title: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: 700,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
    letterSpacing: -0.6,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#1B7A55',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
