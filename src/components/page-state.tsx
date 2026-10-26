import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingState({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.centered}>
      <View style={[styles.iconBubble, { backgroundColor: theme.accentSoft }]}>
        <ActivityIndicator accessibilityLabel="Carregando" color={theme.accent} size="small" />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {message}
      </ThemedText>
    </ThemedView>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <ThemedView style={styles.centered}>
      <StateIcon icon="warning" tone="danger" />
      <ThemedText type="subtitle">Não foi possível carregar</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        {message}
      </ThemedText>
      <AppButton
        icon="reset"
        label="Tentar novamente"
        onPress={onRetry}
        style={styles.retryButton}
      />
    </ThemedView>
  );
}

function StateIcon({
  icon,
  tone,
}: {
  icon: IconName;
  tone: 'danger' | 'accent';
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.iconBubble,
        { backgroundColor: tone === 'danger' ? theme.dangerSoft : theme.accentSoft },
      ]}>
      <Icon color={tone === 'danger' ? theme.danger : theme.accent} name={icon} size={24} />
    </View>
  );
}

export function EmptyIcon() {
  const theme = useTheme();

  return (
    <View style={[styles.iconBubble, { backgroundColor: theme.accentSoft }]}>
      <Icon color={theme.accent} name="dropletOutline" size={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    maxWidth: 320,
    textAlign: 'center',
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  retryButton: {
    marginTop: Spacing.two,
  },
});
