import { DEFAULT_GOAL_ML } from '@/constants/hydration';
import type { GoalChange, IntakeEntry, WaterState } from '@/domain/entities';
import { dayKeyFromDate, localTimeFromDate } from '@/utils/date';

export const FIXED_NOW = new Date(2026, 9, 25, 15, 30, 0, 0);
export const FIXED_DAY_KEY = dayKeyFromDate(FIXED_NOW);

export function makeEntry(overrides: Partial<IntakeEntry> = {}): IntakeEntry {
  return {
    id: overrides.id ?? 'entry-1',
    dayKey: overrides.dayKey ?? FIXED_DAY_KEY,
    createdAt: overrides.createdAt ?? FIXED_NOW.toISOString(),
    localTime: overrides.localTime ?? localTimeFromDate(FIXED_NOW),
    volumeMl: overrides.volumeMl ?? 250,
  };
}

export function makeGoalChange(overrides: Partial<GoalChange> = {}): GoalChange {
  return {
    effectiveFrom: overrides.effectiveFrom ?? FIXED_DAY_KEY,
    goalMl: overrides.goalMl ?? DEFAULT_GOAL_ML,
  };
}

export function makeState(overrides: Partial<WaterState> = {}): WaterState {
  const goalHistory = overrides.goalHistory ?? [];
  const defaultGoalMl =
    overrides.settings?.defaultGoalMl ??
    (goalHistory.length > 0 ? goalHistory[goalHistory.length - 1].goalMl : DEFAULT_GOAL_ML);

  return {
    schemaVersion: 1,
    settings: { defaultGoalMl },
    goalHistory,
    entriesByDay: overrides.entriesByDay ?? {},
  };
}

export function makeThirtyDayFixture(now: Date = FIXED_NOW): WaterState {
  const entriesByDay: Record<string, IntakeEntry[]> = {};
  let id = 1;

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset, 10, 0, 0, 0);
    const dayKey = dayKeyFromDate(date);
    const entries: IntakeEntry[] = [];
    for (let index = 0; index < 2; index += 1) {
      const createdAt = new Date(date.getTime() + index * 60 * 60 * 1000);
      entries.push({
        id: `fixture-${id++}`,
        dayKey,
        createdAt: createdAt.toISOString(),
        localTime: localTimeFromDate(createdAt),
        volumeMl: index === 0 ? 250 : 500,
      });
    }
    entriesByDay[dayKey] = entries;
  }

  return makeState({ entriesByDay });
}
