import { MAX_GOAL_ML, MAX_VOLUME_ML, MIN_GOAL_ML, MIN_VOLUME_ML } from '@/constants/hydration';
import { fail, ok, type Result } from '@/domain/errors';

export function parseIntegerInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0 || !/^\d+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function validateVolumeMl(value: unknown): Result<number> {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < MIN_VOLUME_ML ||
    value > MAX_VOLUME_ML
  ) {
    return fail('INVALID_VOLUME');
  }
  return ok(value);
}

export function validateGoalMl(value: unknown): Result<number> {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < MIN_GOAL_ML ||
    value > MAX_GOAL_ML
  ) {
    return fail('INVALID_GOAL');
  }
  return ok(value);
}

export function parseVolumeInput(raw: string): Result<number> {
  const parsed = parseIntegerInput(raw);
  if (parsed === null) {
    return fail('INVALID_VOLUME');
  }
  return validateVolumeMl(parsed);
}

export function parseGoalInput(raw: string): Result<number> {
  const parsed = parseIntegerInput(raw);
  if (parsed === null) {
    return fail('INVALID_GOAL');
  }
  return validateGoalMl(parsed);
}
