import type { GoalChange, WaterState } from '@/domain/entities';
import type { Result } from '@/domain/errors';
import { dayKeyFromDate } from '@/utils/date';
import { validateGoalMl } from '@/utils/validation';
import type { SetDailyGoalInput } from '@/usecases/types';

export type SetDailyGoalResult = Result<{ state: WaterState }>;

export function setDailyGoal(state: WaterState, input: SetDailyGoalInput): SetDailyGoalResult {
  const validation = validateGoalMl(input.goalMl);
  if (!validation.ok) {
    return validation;
  }

  const today = dayKeyFromDate(input.now);
  const otherChanges = state.goalHistory.filter((change) => change.effectiveFrom !== today);
  const goalHistory: GoalChange[] = [
    ...otherChanges,
    { effectiveFrom: today, goalMl: validation.value },
  ].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

  return {
    ok: true,
    value: {
      state: {
        ...state,
        settings: { ...state.settings, defaultGoalMl: validation.value },
        goalHistory,
      },
    },
  };
}
