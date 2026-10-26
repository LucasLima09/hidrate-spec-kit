import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AnimatedSplashOverlay() {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => setVisible(false));
      }}
      style={[styles.overlay, { backgroundColor: theme.accentDark }]}>
      <View style={styles.logo}>
        <Icon color={theme.accentDark} name="droplet" size={38} />
      </View>
      <ThemedText type="subtitle" style={styles.brand}>
        Hidrate
      </ThemedText>
      <ThemedText type="small" style={styles.tagline}>
        Seu dia, mais leve.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: '#8BE7B9',
    borderRadius: Radius.pill,
    height: 84,
    justifyContent: 'center',
    marginBottom: Spacing.three,
    width: 84,
  },
  brand: {
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.66)',
    marginTop: Spacing.one,
  },
});
