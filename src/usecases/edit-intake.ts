import type { IntakeEntry, WaterState } from '@/domain/entities';
import { fail, type Result } from '@/domain/errors';
import { dayKeyFromDate } from '@/utils/date';
import { validateVolumeMl } from '@/utils/validation';
import type { EditIntakeInput } from '@/usecases/types';

export type EditIntakeResult = Result<{ state: WaterState; entry: IntakeEntry }>;

function entryExistsInOtherDay(state: WaterState, entryId: string, todayKey: string): boolean {
  return Object.entries(state.entriesByDay).some(
    ([dayKey, entries]) => dayKey !== todayKey && entries.some((entry) => entry.id === entryId)
  );
}

export function editIntake(state: WaterState, input: EditIntakeInput): EditIntakeResult {
  const validation = validateVolumeMl(input.volumeMl);
  if (!validation.ok) {
    return validation;
  }

  const todayKey = dayKeyFromDate(input.now);
  const dayEntries = state.entriesByDay[todayKey] ?? [];
  const existing = dayEntries.find((entry) => entry.id === input.entryId);

  if (!existing) {
    if (entryExistsInOtherDay(state, input.entryId, todayKey)) {
      return fail('ENTRY_NOT_EDITABLE');
    }
    return fail('ENTRY_NOT_FOUND');
  }

  const updatedEntry: IntakeEntry = { ...existing, volumeMl: validation.value };
  return {
    ok: true,
    value: {
      state: {
        ...state,
        entriesByDay: {
          ...state.entriesByDay,
          [todayKey]: dayEntries.map((entry) =>
            entry.id === input.entryId ? updatedEntry : entry
          ),
        },
      },
      entry: updatedEntry,
    },
  };
}
