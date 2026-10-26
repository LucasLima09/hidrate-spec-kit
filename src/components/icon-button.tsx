import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface IconButtonProps {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: IconName;
  onPress: () => void;
  tone?: 'neutral' | 'danger';
}

export function IconButton({
  accessibilityLabel,
  disabled = false,
  icon,
  onPress,
  tone = 'neutral',
}: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: tone === 'danger' ? theme.dangerSoft : theme.backgroundElement,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}>
      <Icon
        color={tone === 'danger' ? theme.danger : theme.accentDark}
        name={icon}
        size={17}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
