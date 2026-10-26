import { DEFAULT_GOAL_ML } from '@/constants/hydration';
import type { WaterState } from '@/domain/entities';
import type { ResolveGoalInput } from '@/usecases/types';

export function resolveGoalForDay(state: WaterState, input: ResolveGoalInput): number {
  for (let index = state.goalHistory.length - 1; index >= 0; index -= 1) {
    const change = state.goalHistory[index];
    if (change.effectiveFrom <= input.dayKey) {
      return change.goalMl;
    }
  }
  return DEFAULT_GOAL_ML;
}
