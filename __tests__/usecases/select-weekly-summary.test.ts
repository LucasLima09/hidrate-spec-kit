import { selectWeeklySummary } from '@/usecases/select-weekly-summary';
import { makeEntry, makeGoalChange, makeState } from '../helpers/fixtures';

const now = new Date(2026, 9, 25, 12, 0, 0);

describe('selectWeeklySummary', () => {
  it('returns exactly seven days from oldest to newest ending today', () => {
    const summary = selectWeeklySummary(makeState(), { now });

    expect(summary.days).toHaveLength(7);
    expect(summary.days.map((day) => day.dayKey)).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ]);
    expect(summary.days[6].dayKey).toBe('2026-10-25');
  });

  it('keeps empty days at zero and not met', () => {
    const summary = selectWeeklySummary(makeState(), { now });
    for (const day of summary.days) {
      expect(day.totalMl).toBe(0);
      expect(day.remainingMl).toBe(day.goalMl);
      expect(day.excessMl).toBe(0);
      expect(day.goalMet).toBe(false);
    }
    expect(summary.daysWithGoalMet).toBe(0);
  });

  it('uses historical goals, skipped days and counts met days', () => {
    const state = makeState({
      goalHistory: [
        makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2000 }),
        makeGoalChange({ effectiveFrom: '2026-10-25', goalMl: 2500 }),
      ],
      entriesByDay: {
        '2026-10-20': [makeEntry({ id: 'a', dayKey: '2026-10-20', volumeMl: 2000 })],
        '2026-10-25': [makeEntry({ id: 'b', dayKey: '2026-10-25', volumeMl: 2500 })],
      },
    });

    const summary = selectWeeklySummary(state, { now });
    expect(summary.days[1].goalMl).toBe(2000);
    expect(summary.days[1].goalMet).toBe(true);
    expect(summary.days[5].goalMl).toBe(2000);
    expect(summary.days[5].totalMl).toBe(0);
    expect(summary.days[6].goalMl).toBe(2500);
    expect(summary.days[6].goalMet).toBe(true);
    expect(summary.daysWithGoalMet).toBe(2);
  });

  it('handles month and year boundaries without duplicate days', () => {
    const summary = selectWeeklySummary(makeState(), {
      now: new Date(2027, 0, 2, 9, 0, 0),
    });

    expect(summary.days.map((day) => day.dayKey)).toEqual([
      '2026-12-27',
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
    expect(new Set(summary.days.map((day) => day.dayKey)).size).toBe(7);
  });
});
