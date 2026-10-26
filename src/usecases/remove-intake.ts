import type { WaterState } from '@/domain/entities';
import { fail, type Result } from '@/domain/errors';
import { dayKeyFromDate } from '@/utils/date';
import type { RemoveIntakeInput } from '@/usecases/types';

export type RemoveIntakeResult = Result<{ state: WaterState }>;

function entryExistsInOtherDay(state: WaterState, entryId: string, todayKey: string): boolean {
  return Object.entries(state.entriesByDay).some(
    ([dayKey, entries]) => dayKey !== todayKey && entries.some((entry) => entry.id === entryId)
  );
}

export function removeIntake(state: WaterState, input: RemoveIntakeInput): RemoveIntakeResult {
  const todayKey = dayKeyFromDate(input.now);
  const dayEntries = state.entriesByDay[todayKey] ?? [];

  if (!dayEntries.some((entry) => entry.id === input.entryId)) {
    if (entryExistsInOtherDay(state, input.entryId, todayKey)) {
      return fail('ENTRY_NOT_EDITABLE');
    }
    return fail('ENTRY_NOT_FOUND');
  }

  const remaining = dayEntries.filter((entry) => entry.id !== input.entryId);
  const entriesByDay = { ...state.entriesByDay };
  if (remaining.length === 0) {
    delete entriesByDay[todayKey];
  } else {
    entriesByDay[todayKey] = remaining;
  }

  return { ok: true, value: { state: { ...state, entriesByDay } } };
}
