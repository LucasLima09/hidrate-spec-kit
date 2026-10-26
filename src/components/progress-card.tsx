import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { DailySummary } from '@/domain/entities';
import { useTheme } from '@/hooks/use-theme';
import { formatPercent, formatVolume, progressBarPercent } from '@/utils/volume';

interface ProgressCardProps {
  summary: DailySummary;
}

export function ProgressCard({ summary }: ProgressCardProps) {
  const theme = useTheme();
  const percent = Math.round(summary.progressPercent);
  const barWidth = progressBarPercent(summary.progressPercent);

  return (
    <View
      accessibilityLabel={`Consumo de hoje: ${summary.totalMl} de ${summary.goalMl} mililitros, ${percent} por cento`}
      style={[styles.card, { backgroundColor: theme.accentDark }]}>
      <View pointerEvents="none" style={styles.decorativeRing} />
      <View pointerEvents="none" style={styles.decorativeDot} />

      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <View style={styles.iconWrap}>
            <Icon color={theme.onAccent} name="droplet" size={15} />
          </View>
          <ThemedText type="smallBold" style={styles.softText}>
            Consumo de hoje
          </ThemedText>
        </View>
        <View style={styles.percentPill}>
          <ThemedText type="smallBold" style={styles.percentText}>
            {formatPercent(summary.progressPercent)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.valueBlock}>
        <ThemedText type="display" style={styles.value}>
          {formatVolume(summary.totalMl)}
        </ThemedText>
        <ThemedText type="small" style={styles.softText}>
          Meta de {formatVolume(summary.goalMl)}
        </ThemedText>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.min(100, percent) }}
        style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: summary.goalMet ? theme.accentBright : theme.onAccent,
              width: `${barWidth}%`,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        {summary.goalMet ? (
          <View style={styles.status}>
            <Icon color={theme.accentBright} name="check" size={16} />
            <ThemedText type="smallBold" style={styles.statusText}>
              Meta atingida
            </ThemedText>
          </View>
        ) : (
          <ThemedText type="small" style={styles.softText}>
            Faltam {formatVolume(summary.remainingMl)}
          </ThemedText>
        )}
        {summary.excessMl > 0 ? (
          <ThemedText type="small" style={styles.softText}>
            +{formatVolume(summary.excessMl)}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xlarge,
    gap: Spacing.three,
    overflow: 'hidden',
    padding: Spacing.four,
  },
  decorativeRing: {
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: Radius.pill,
    borderWidth: 24,
    height: 180,
    position: 'absolute',
    right: -74,
    top: -84,
    width: 180,
  },
  decorativeDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.pill,
    bottom: -32,
    height: 96,
    position: 'absolute',
    right: 28,
    width: 96,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: Radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  percentPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  percentText: {
    color: '#FFFFFF',
  },
  softText: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  valueBlock: {
    gap: Spacing.half,
  },
  value: {
    color: '#FFFFFF',
  },
  track: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: Radius.pill,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.pill,
    height: '100%',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
  },
  statusText: {
    color: '#8BE7B9',
  },
});
