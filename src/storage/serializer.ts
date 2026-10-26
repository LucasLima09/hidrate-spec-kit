import type { WaterState } from '@/domain/entities';
import { fail, type Result } from '@/domain/errors';
import { normalizeState } from '@/storage/schema';

export function serialize(state: WaterState): string {
  return JSON.stringify(state);
}

export function deserialize(raw: string): Result<WaterState> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail('STORAGE_CORRUPTED');
  }
  return normalizeState(parsed);
}
