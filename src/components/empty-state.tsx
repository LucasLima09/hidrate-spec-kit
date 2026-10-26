import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyIcon } from '@/components/page-state';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <EmptyIcon />
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          style={styles.action}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  message: {
    maxWidth: 280,
    textAlign: 'center',
  },
  action: {
    justifyContent: 'center',
    marginTop: Spacing.one,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: Spacing.three,
  },
});
