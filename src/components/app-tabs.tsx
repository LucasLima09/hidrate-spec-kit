import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.accentSoft}
      iconColor={{ default: colors.textTertiary, selected: colors.accent }}
      labelStyle={{ default: { color: colors.textSecondary }, selected: { color: colors.accentDark } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Hoje</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="water_drop" sf="drop.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="week">
        <NativeTabs.Trigger.Label>Semana</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="bar_chart" sf="chart.bar.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="goal">
        <NativeTabs.Trigger.Label>Meta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="flag" sf="target" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
