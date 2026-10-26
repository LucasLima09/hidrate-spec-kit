import type { DailySummary, WaterState } from '@/domain/entities';
import { resolveGoalForDay } from '@/usecases/resolve-goal-for-day';
import type { SelectDailySummaryInput } from '@/usecases/types';

export function selectDailySummary(
  state: WaterState,
  input: SelectDailySummaryInput
): DailySummary {
  const entries = state.entriesByDay[input.dayKey] ?? [];
  const totalMl = entries.reduce((sum, entry) => sum + entry.volumeMl, 0);
  const goalMl = resolveGoalForDay(state, { dayKey: input.dayKey });
  const progressPercent = goalMl > 0 ? (totalMl / goalMl) * 100 : 0;

  return {
    dayKey: input.dayKey,
    totalMl,
    goalMl,
    progressPercent,
    remainingMl: Math.max(0, goalMl - totalMl),
    excessMl: Math.max(0, totalMl - goalMl),
    goalMet: totalMl >= goalMl,
    entryCount: entries.length,
  };
}
