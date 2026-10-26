import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: IconName;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}

export function AppButton({
  accessibilityLabel,
  disabled = false,
  icon,
  label,
  onPress,
  style,
  variant = 'primary',
}: AppButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const iconColor = isPrimary
    ? theme.onAccent
    : isDanger
      ? theme.danger
      : theme.accent;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary
            ? theme.accent
            : isDanger
              ? theme.dangerSoft
              : variant === 'secondary'
                ? theme.accentSoft
                : 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
        },
        style,
      ]}>
      <View style={styles.content}>
        {icon ? <Icon color={iconColor} name={icon} size={18} /> : null}
        <ThemedText
          type="smallBold"
          style={[
            styles.label,
            {
              color: isPrimary
                ? theme.onAccent
                : isDanger
                  ? theme.danger
                  : theme.accentDark,
            },
          ]}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: Radius.medium,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: Spacing.four,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
  },
});
