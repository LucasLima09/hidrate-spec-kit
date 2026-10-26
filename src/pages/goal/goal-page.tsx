import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { BrandMark } from '@/components/brand-mark';
import { FormField } from '@/components/form-field';
import { Icon } from '@/components/icon';
import { ErrorState, LoadingState } from '@/components/page-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useHydration } from '@/controllers/use-hydration';
import { useTheme } from '@/hooks/use-theme';
import { formatVolume } from '@/utils/volume';
import { parseGoalInput } from '@/utils/validation';

export function GoalPage() {
  const { status, state, warning, retry } = useHydration();

  if (status === 'loading') {
    return <LoadingState message="Carregando sua meta..." />;
  }

  if (status === 'error' || !state) {
    return (
      <ErrorState
        message={warning?.message ?? 'Tente novamente em alguns instantes.'}
        onRetry={() => {
          void retry();
        }}
      />
    );
  }

  return <GoalForm currentGoal={state.settings.defaultGoalMl} />;
}

function GoalForm({ currentGoal }: { currentGoal: number }) {
  const { isSaving, setDailyGoal } = useHydration();
  const theme = useTheme();
  const [value, setValue] = useState(String(currentGoal));
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = async () => {
    const parsed = parseGoalInput(value);
    if (!parsed.ok) {
      setFeedback(null);
      setError(parsed.error.message);
      return;
    }

    setError(null);
    setFeedback(null);
    const success = await setDailyGoal(parsed.value);
    if (success) {
      setFeedback('Meta atualizada com sucesso.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <BrandMark />
            <View style={[styles.tag, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Icon color={theme.accent} name="target" size={14} />
              <ThemedText type="small" themeColor="textSecondary">
                Seu ritmo
              </ThemedText>
            </View>
          </View>

          <View style={styles.heading}>
            <ThemedText type="overline" themeColor="textSecondary">
              Planejamento
            </ThemedText>
            <ThemedText type="title">Meta diária</ThemedText>
          </View>

          <View style={[styles.hero, { backgroundColor: theme.accentDark }]}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Icon color={theme.accentDark} name="target" size={20} />
              </View>
              <ThemedText type="smallBold" style={styles.heroLabel}>
                Meta atual
              </ThemedText>
            </View>
            <ThemedText type="display" style={styles.heroValue}>
              {formatVolume(currentGoal)}
            </ThemedText>
            <ThemedText type="small" style={styles.softText}>
              Ajuste a quantidade ideal para o seu dia.
            </ThemedText>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.formHeading}>
              <ThemedText type="smallBold">Definir nova meta</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Entre 500 ml e 10.000 ml.
              </ThemedText>
            </View>

            <FormField
              accessibilityLabel="Meta diária em mililitros"
              editable={!isSaving}
              error={error}
              label="Meta (ml)"
              onChangeText={(next) => {
                setValue(next);
                if (error) {
                  setError(null);
                }
                if (feedback) {
                  setFeedback(null);
                }
              }}
              testID="goal-input"
              value={value}
            />

            <AppButton
              accessibilityLabel="Salvar meta"
              disabled={isSaving}
              icon="check"
              label={isSaving ? 'Salvando...' : 'Salvar meta'}
              onPress={() => {
                void handleSave();
              }}
            />

            {feedback ? (
              <View style={[styles.feedback, { backgroundColor: theme.successSoft }]}>
                <Icon color={theme.success} name="check" size={17} />
                <ThemedText
                  accessibilityLiveRegion="polite"
                  style={[styles.feedbackText, { color: theme.success }]}
                  type="smallBold">
                  {feedback}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.note}>
            <Icon color={theme.textTertiary} name="info" size={16} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.noteText}>
              A nova meta vale para hoje e para os próximos dias. Dias anteriores não serão
              alterados.
            </ThemedText>
          </View>
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
  tag: {
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
  hero: {
    borderRadius: Radius.xlarge,
    gap: Spacing.two,
    overflow: 'hidden',
    padding: Spacing.four,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: '#8BE7B9',
    borderRadius: Radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  heroLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  heroValue: {
    color: '#FFFFFF',
  },
  softText: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  formCard: {
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  formHeading: {
    gap: 1,
  },
  feedback: {
    alignItems: 'center',
    borderRadius: Radius.medium,
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  feedbackText: {
    flex: 1,
  },
  note: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  noteText: {
    flex: 1,
    lineHeight: 19,
  },
});
