import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { AppError } from '@/domain/errors';
import { useTheme } from '@/hooks/use-theme';

interface ErrorBannerProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  const theme = useTheme();

  if (!error) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        { backgroundColor: theme.dangerSoft, borderColor: theme.danger },
      ]}>
      <View style={styles.messageRow}>
        <Icon color={theme.danger} name="warning" size={18} />
        <ThemedText type="small" style={styles.message}>
          {error.message}
        </ThemedText>
      </View>
      <View style={styles.actions}>
        {onRetry ? (
          <Pressable
            accessibilityLabel="Tentar novamente"
            accessibilityRole="button"
            onPress={onRetry}
            style={styles.pressable}>
            <ThemedText type="smallBold" style={{ color: theme.danger }}>
              Tentar novamente
            </ThemedText>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable
            accessibilityLabel="Fechar aviso"
            accessibilityRole="button"
            onPress={onDismiss}
            style={styles.pressable}>
            <ThemedText type="smallBold" style={{ color: theme.danger }}>
              Fechar
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  messageRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  message: {
    flex: 1,
    fontWeight: 600,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingLeft: 26,
  },
  pressable: {
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 44,
  },
});
