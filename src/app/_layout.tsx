import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { GlobalStorageBanner } from '@/components/global-storage-banner';
import { Colors } from '@/constants/theme';
import { HydrationProvider } from '@/controllers/hydration-provider';

SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    border: Colors.light.border,
    card: Colors.light.surface,
    notification: Colors.light.danger,
    primary: Colors.light.accent,
    text: Colors.light.text,
  },
};

export default function TabLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <HydrationProvider>
        <StatusBar style="dark" />
        <AnimatedSplashOverlay />
        <AppTabs />
        <GlobalStorageBanner />
      </HydrationProvider>
    </ThemeProvider>
  );
}
