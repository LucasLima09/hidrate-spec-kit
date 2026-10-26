import type { IntakeEntry, WaterState } from '@/domain/entities';
import type { Result } from '@/domain/errors';
import { dayKeyFromDate, localTimeFromDate } from '@/utils/date';
import { validateVolumeMl } from '@/utils/validation';
import type { AddIntakeInput } from '@/usecases/types';

export type AddIntakeResult = Result<{ state: WaterState; entry: IntakeEntry }>;

export function addIntake(state: WaterState, input: AddIntakeInput): AddIntakeResult {
  const validation = validateVolumeMl(input.volumeMl);
  if (!validation.ok) {
    return validation;
  }

  const dayKey = dayKeyFromDate(input.now);
  const entry: IntakeEntry = {
    id: input.id,
    dayKey,
    createdAt: input.now.toISOString(),
    localTime: localTimeFromDate(input.now),
    volumeMl: validation.value,
  };

  const dayEntries = state.entriesByDay[dayKey] ?? [];
  return {
    ok: true,
    value: {
      state: {
        ...state,
        entriesByDay: {
          ...state.entriesByDay,
          [dayKey]: [...dayEntries, entry],
        },
      },
      entry,
    },
  };
}
