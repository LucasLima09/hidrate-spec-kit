import {
  DEFAULT_GOAL_ML,
  MAX_GOAL_ML,
  MAX_VOLUME_ML,
  MIN_GOAL_ML,
  MIN_VOLUME_ML,
  SCHEMA_VERSION,
} from '@/constants/hydration';
import type { GoalChange, IntakeEntry, WaterState } from '@/domain/entities';
import { appError, fail, ok, type Result } from '@/domain/errors';
import { isDayKey, isLocalTime } from '@/utils/date';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function isParseableDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function createInitialState(): WaterState {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { defaultGoalMl: DEFAULT_GOAL_ML },
    goalHistory: [],
    entriesByDay: {},
  };
}

export function normalizeState(input: unknown): Result<WaterState> {
  if (!isPlainObject(input)) {
    return fail('STORAGE_CORRUPTED');
  }

  if (input.schemaVersion !== SCHEMA_VERSION) {
    return fail('STORAGE_CORRUPTED');
  }

  const settings = input.settings;
  if (!isPlainObject(settings) || !isIntegerInRange(settings.defaultGoalMl, MIN_GOAL_ML, MAX_GOAL_ML)) {
    return fail('STORAGE_CORRUPTED');
  }

  if (!Array.isArray(input.goalHistory)) {
    return fail('STORAGE_CORRUPTED');
  }

  const goalHistory: GoalChange[] = [];
  let previousEffectiveFrom = '';
  for (const item of input.goalHistory) {
    if (
      !isPlainObject(item) ||
      !isDayKey(item.effectiveFrom) ||
      !isIntegerInRange(item.goalMl, MIN_GOAL_ML, MAX_GOAL_ML)
    ) {
      return fail('STORAGE_CORRUPTED');
    }
    if (item.effectiveFrom <= previousEffectiveFrom) {
      return fail('STORAGE_CORRUPTED');
    }
    previousEffectiveFrom = item.effectiveFrom;
    goalHistory.push({ effectiveFrom: item.effectiveFrom, goalMl: item.goalMl });
  }

  const expectedDefaultGoal =
    goalHistory.length > 0 ? goalHistory[goalHistory.length - 1].goalMl : DEFAULT_GOAL_ML;
  if (settings.defaultGoalMl !== expectedDefaultGoal) {
    return fail('STORAGE_CORRUPTED');
  }

  if (!isPlainObject(input.entriesByDay)) {
    return fail('STORAGE_CORRUPTED');
  }

  const entriesByDay: Record<string, IntakeEntry[]> = {};
  const seenIds = new Set<string>();

  for (const [dayKey, value] of Object.entries(input.entriesByDay)) {
    if (!isDayKey(dayKey) || !Array.isArray(value)) {
      return fail('STORAGE_CORRUPTED');
    }
    if (value.length === 0) {
      continue;
    }

    const entries: IntakeEntry[] = [];
    for (const item of value) {
      if (
        !isPlainObject(item) ||
        typeof item.id !== 'string' ||
        item.id.length === 0 ||
        item.dayKey !== dayKey ||
        !isParseableDate(item.createdAt) ||
        !isLocalTime(item.localTime) ||
        !isIntegerInRange(item.volumeMl, MIN_VOLUME_ML, MAX_VOLUME_ML)
      ) {
        return fail('STORAGE_CORRUPTED');
      }
      if (seenIds.has(item.id)) {
        return fail('STORAGE_CORRUPTED');
      }
      seenIds.add(item.id);
      entries.push({
        id: item.id,
        dayKey,
        createdAt: item.createdAt,
        localTime: item.localTime,
        volumeMl: item.volumeMl,
      });
    }

    entries.sort((a, b) => {
      const first = Date.parse(a.createdAt);
      const second = Date.parse(b.createdAt);
      return first - second;
    });
    entriesByDay[dayKey] = entries;
  }

  return ok({
    schemaVersion: SCHEMA_VERSION,
    settings: { defaultGoalMl: settings.defaultGoalMl },
    goalHistory,
    entriesByDay,
  });
}

export function storageError(message?: string): Result<never> {
  return { ok: false, error: appError('STORAGE_ERROR', message) };
}
