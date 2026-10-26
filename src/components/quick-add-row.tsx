import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { QUICK_ADD_VALUES } from '@/constants/hydration';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface QuickAddRowProps {
  onAdd: (volumeMl: number) => Promise<boolean>;
  disabled?: boolean;
}

export function QuickAddRow({ onAdd, disabled = false }: QuickAddRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {QUICK_ADD_VALUES.map((value) => (
        <Pressable
          accessibilityLabel={`Adicionar ${value} mililitros`}
          accessibilityRole="button"
          disabled={disabled}
          key={value}
          onPress={() => {
            void onAdd(value);
          }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity: disabled ? 0.5 : pressed ? 0.72 : 1,
            },
          ]}>
          <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}>
            <Icon color={theme.accent} name="add" size={16} />
          </View>
          <View style={styles.valueRow}>
            <ThemedText type="smallBold" style={styles.value}>
              +{value}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              ml
            </ThemedText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    alignItems: 'center',
    borderRadius: Radius.large,
    borderWidth: 1,
    flex: 1,
    gap: Spacing.two,
    justifyContent: 'center',
    minHeight: 92,
    minWidth: 44,
    paddingVertical: Spacing.three,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  valueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 2,
  },
  value: {
    fontSize: 16,
  },
});
