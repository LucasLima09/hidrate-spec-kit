import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { Icon } from '@/components/icon';
import { ErrorState, LoadingState } from '@/components/page-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeeklySummaryList } from '@/components/weekly-summary-list';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCurrentDay } from '@/controllers/use-current-day';
import { useHydration } from '@/controllers/use-hydration';
import { useTheme } from '@/hooks/use-theme';

export function WeekPage() {
  const { status, week, warning, retry } = useHydration();
  const { todayKey } = useCurrentDay();
  const theme = useTheme();

  if (status === 'loading') {
    return <LoadingState message="Carregando a semana..." />;
  }

  if (status === 'error' || !week) {
    return (
      <ErrorState
        message={warning?.message ?? 'Tente novamente em alguns instantes.'}
        onRetry={() => {
          void retry();
        }}
      />
    );
  }

  const weeklyProgress = Math.round((week.daysWithGoalMet / 7) * 100);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <BrandMark />
            <View style={[styles.yearPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Icon color={theme.accent} name="sparkle" size={14} />
              <ThemedText type="small" themeColor="textSecondary">
                Sua constância
              </ThemedText>
            </View>
          </View>

          <View style={styles.heading}>
            <ThemedText type="overline" themeColor="textSecondary">
              Semana
            </ThemedText>
            <ThemedText type="title">Últimos 7 dias</ThemedText>
          </View>

          <View style={[styles.overview, { backgroundColor: theme.accentDark }]}>
            <View style={styles.overviewTop}>
              <View style={styles.overviewIcon}>
                <Icon color={theme.accentDark} name="trophy" size={20} />
              </View>
              <ThemedText type="smallBold" style={styles.overviewLabel}>
                Meta atingida
              </ThemedText>
            </View>
            <View style={styles.overviewValueRow}>
              <ThemedText type="display" style={styles.overviewValue}>
                {week.daysWithGoalMet}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.overviewTotal}>
                / 7
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.softText}>
              {week.daysWithGoalMet} de 7 dias com a meta atingida
            </ThemedText>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { backgroundColor: theme.accentBright, width: `${weeklyProgress}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <ThemedText type="smallBold">Resumo diário</ThemedText>
            <ThemedText type="small" themeColor="textTertiary">
              Total e meta
            </ThemedText>
          </View>

          <WeeklySummaryList summary={week} todayKey={todayKey} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yearPill: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  heading: {
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  overview: {
    borderRadius: Radius.xlarge,
    gap: Spacing.two,
    overflow: 'hidden',
    padding: Spacing.four,
  },
  overviewTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  overviewIcon: {
    alignItems: 'center',
    backgroundColor: '#8BE7B9',
    borderRadius: Radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  overviewLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  overviewValueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  overviewValue: {
    color: '#FFFFFF',
  },
  overviewTotal: {
    color: 'rgba(255, 255, 255, 0.52)',
    fontSize: 24,
  },
  softText: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  track: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: Radius.pill,
    height: 8,
    marginTop: Spacing.two,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.pill,
    height: '100%',
  },
  sectionHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
});
