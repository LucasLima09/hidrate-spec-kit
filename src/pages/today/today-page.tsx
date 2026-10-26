import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Icon } from '@/components/icon';
import { IntakeEditDialog } from '@/components/intake-edit-dialog';
import { IntakeForm } from '@/components/intake-form';
import { IntakeHistoryList } from '@/components/intake-history-list';
import { ErrorState, LoadingState } from '@/components/page-state';
import { ProgressCard } from '@/components/progress-card';
import { QuickAddRow } from '@/components/quick-add-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useHydration } from '@/controllers/use-hydration';
import type { IntakeEntry } from '@/domain/entities';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/utils/date';
import { formatVolume } from '@/utils/volume';

export function TodayPage() {
  const {
    status,
    state,
    today,
    warning,
    isSaving,
    addIntake,
    editIntake,
    removeIntake,
    retry,
  } = useHydration();
  const theme = useTheme();
  const [editing, setEditing] = useState<IntakeEntry | null>(null);
  const [removing, setRemoving] = useState<IntakeEntry | null>(null);

  if (status === 'loading') {
    return <LoadingState message="Carregando seus registros..." />;
  }

  if (status === 'error' || !state || !today) {
    return (
      <ErrorState
        message={warning?.message ?? 'Tente novamente em alguns instantes.'}
        onRetry={() => {
          void retry();
        }}
      />
    );
  }

  const entries = state.entriesByDay[today.dayKey] ?? [];

  const header = (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <BrandMark />
        <View
          style={[
            styles.datePill,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <Icon color={theme.accent} name="calendar" size={14} />
          <ThemedText type="small" themeColor="textSecondary">
            {formatDate(today.dayKey)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.heading}>
        <ThemedText type="overline" themeColor="textSecondary">
          Hoje
        </ThemedText>
        <ThemedText type="title">Como está sua hidratação?</ThemedText>
      </View>

      <ProgressCard summary={today} />

      <View style={styles.sectionHeading}>
        <ThemedText type="smallBold">Adicionar agora</ThemedText>
        <ThemedText type="small" themeColor="textTertiary">
          Um toque para registrar
        </ThemedText>
      </View>
      <QuickAddRow disabled={isSaving} onAdd={addIntake} />

      <IntakeForm disabled={isSaving} onSubmit={addIntake} />

      <View style={styles.historyHeading}>
        <ThemedText type="smallBold" style={styles.historyTitle}>
          Histórico do dia
        </ThemedText>
        <View style={[styles.countPill, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {entries.length === 1 ? '1 registro' : `${entries.length} registros`}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <IntakeHistoryList
          disabled={isSaving}
          entries={entries}
          header={header}
          onEdit={setEditing}
          onRemove={setRemoving}
        />
      </SafeAreaView>

      <IntakeEditDialog
        entry={editing}
        key={editing?.id ?? 'none'}
        onCancel={() => setEditing(null)}
        onSave={async (entryId, volumeMl) => {
          const success = await editIntake(entryId, volumeMl);
          return success;
        }}
        saving={isSaving}
        visible={editing !== null}
      />

      <ConfirmDialog
        confirmLabel="Remover"
        destructive
        message={
          removing
            ? `Remover o registro de ${formatVolume(removing.volumeMl)} das ${removing.localTime}?`
            : ''
        }
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const entry = removing;
          setRemoving(null);
          if (entry) {
            void removeIntake(entry.id);
          }
        }}
        title="Remover registro"
        visible={removing !== null}
      />
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
    paddingBottom: BottomTabInset + Spacing.three,
    paddingHorizontal: Spacing.three,
    width: '100%',
  },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePill: {
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
  sectionHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  historyHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  historyTitle: {
    fontSize: 16,
  },
  countPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
});
