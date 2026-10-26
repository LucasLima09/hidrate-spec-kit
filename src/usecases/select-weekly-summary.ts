import type { WeeklySummary, WaterState } from '@/domain/entities';
import { lastSevenDayKeys } from '@/utils/date';
import { selectDailySummary } from '@/usecases/select-daily-summary';
import type { SelectWeeklySummaryInput } from '@/usecases/types';

export function selectWeeklySummary(
  state: WaterState,
  input: SelectWeeklySummaryInput
): WeeklySummary {
  const days = lastSevenDayKeys(input.now).map((dayKey) =>
    selectDailySummary(state, { dayKey })
  );

  return {
    days,
    daysWithGoalMet: days.filter((day) => day.goalMet).length,
  };
}
