import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/error-banner';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useHydration } from '@/controllers/use-hydration';

export function GlobalStorageBanner() {
  const { warning, retry, clearWarning } = useHydration();
  const insets = useSafeAreaInsets();

  if (!warning) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + Spacing.two }]}>
      <View style={styles.inner}>
        <ErrorBanner error={warning} onDismiss={clearWarning} onRetry={retry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    left: Spacing.three,
    position: 'absolute',
    right: Spacing.three,
    zIndex: 1000,
  },
  inner: {
    maxWidth: MaxContentWidth,
    width: '100%',
  },
});
