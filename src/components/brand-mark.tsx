import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: theme.accent }]}>
        <Icon color={theme.onAccent} name="droplet" size={18} />
      </View>
      {compact ? null : <ThemedText type="smallBold">Hidrate</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  badge: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
