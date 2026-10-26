import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger asChild href="/" name="today">
            <TabButton icon="home">Hoje</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/week" name="week">
            <TabButton icon="chart">Semana</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/goal" name="goal">
            <TabButton icon="target">Meta</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  icon: IconName;
};

export function TabButton({ children, icon, isFocused, ref: _ref, ...props }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      {...props}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <View
        style={[
          styles.tabButtonView,
          { backgroundColor: isFocused ? theme.accent : 'transparent' },
        ]}>
        <Icon
          color={isFocused ? theme.onAccent : theme.textTertiary}
          name={icon}
          size={16}
        />
        <ThemedText
          type="smallBold"
          style={{ color: isFocused ? theme.onAccent : theme.textSecondary }}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        <View style={styles.tabs}>{props.children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: Spacing.three,
    position: 'absolute',
    width: '100%',
  },
  innerContainer: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    boxShadow: '0px 14px 40px rgba(16, 64, 43, 0.14)',
    flexDirection: 'row',
    gap: Spacing.one,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  pressable: {
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.72,
  },
  tabButtonView: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    flexDirection: 'row',
    gap: Spacing.one,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: Spacing.two,
  },
});
