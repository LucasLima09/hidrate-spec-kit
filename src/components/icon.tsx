import { SymbolView } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

const ICONS = {
  droplet: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  dropletOutline: { ios: 'drop', android: 'water_drop', web: 'water_drop' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  addCircle: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  target: { ios: 'target', android: 'target', web: 'target' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  chart: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  history: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  trend: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  sparkle: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  flame: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
  warning: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    web: 'warning',
  },
  reset: { ios: 'arrow.uturn.backward', android: 'undo', web: 'undo' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  trophy: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  color?: string;
  name: IconName;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ color = '#10261D', name, size = 20, style }: IconProps) {
  return (
    <SymbolView
      accessible={false}
      importantForAccessibility="no"
      name={ICONS[name]}
      size={size}
      style={[{ height: size, width: size }, style]}
      tintColor={color}
    />
  );
}
