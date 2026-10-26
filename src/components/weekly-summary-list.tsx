import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { WeeklySummary } from '@/domain/entities';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/utils/date';
import { formatVolume, progressBarPercent } from '@/utils/volume';

interface WeeklySummaryListProps {
  summary: WeeklySummary;
  todayKey: string;
}

export function WeeklySummaryList({ summary, todayKey }: WeeklySummaryListProps) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {summary.days.map((day) => {
        const isToday = day.dayKey === todayKey;
        const status = day.goalMet ? 'Meta atingida' : 'Meta não atingida';

        return (
          <View
            accessibilityLabel={`${formatDate(day.dayKey)}, ${day.totalMl} de ${day.goalMl} mililitros, ${status}`}
            key={day.dayKey}
            style={[
              styles.row,
              {
                backgroundColor: theme.surface,
                borderColor: isToday ? theme.accentMuted : theme.border,
              },
              isToday && { backgroundColor: theme.surfaceMuted },
            ]}
            testID={`week-row-${day.dayKey}`}>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: day.goalMet ? theme.successSoft : theme.backgroundElement,
                },
              ]}>
              <Icon
                color={day.goalMet ? theme.success : theme.textTertiary}
                name={day.goalMet ? 'check' : 'dropletOutline'}
                size={17}
              />
            </View>

            <View style={styles.content}>
              <View style={styles.topLine}>
                <View style={styles.dayInfo}>
                  <ThemedText type="smallBold">{formatDate(day.dayKey)}</ThemedText>
                  {isToday ? (
                    <View style={[styles.todayPill, { backgroundColor: theme.accentSoft }]}>
                      <ThemedText type="small" style={{ color: theme.accentDark }}>
                        Hoje
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.values}>
                  <ThemedText type="smallBold">{formatVolume(day.totalMl)}</ThemedText>
                  <ThemedText type="small" themeColor="textTertiary">
                    de {formatVolume(day.goalMl)}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: day.goalMet ? theme.accent : theme.accentMuted,
                      width: `${progressBarPercent(day.progressPercent)}%`,
                    },
                  ]}
                />
              </View>

              <ThemedText
                type="small"
                style={{ color: day.goalMet ? theme.success : theme.warning }}>
                {status}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    alignItems: 'flex-start',
    borderRadius: Radius.large,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  statusIcon: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 36,
    justifyContent: 'center',
    marginTop: 2,
    width: 36,
  },
  content: {
    flex: 1,
    gap: Spacing.two,
  },
  topLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  dayInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  todayPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
  },
  values: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: Spacing.one,
  },
  track: {
    borderRadius: Radius.pill,
    height: 5,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.pill,
    height: '100%',
  },
});
