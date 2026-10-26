import { selectDailySummary } from '@/usecases/select-daily-summary';
import { makeEntry, makeGoalChange, makeState } from '../helpers/fixtures';

describe('selectDailySummary', () => {
  it('returns zero totals for an empty day', () => {
    const summary = selectDailySummary(makeState(), { dayKey: '2026-10-25' });
    expect(summary).toEqual({
      dayKey: '2026-10-25',
      totalMl: 0,
      goalMl: 2000,
      progressPercent: 0,
      remainingMl: 2000,
      excessMl: 0,
      goalMet: false,
      entryCount: 0,
    });
  });

  it('sums the day and reports remaining volume', () => {
    const state = makeState({
      entriesByDay: {
        '2026-10-25': [
          makeEntry({ id: 'a', volumeMl: 250 }),
          makeEntry({ id: 'b', volumeMl: 500 }),
        ],
      },
    });

    const summary = selectDailySummary(state, { dayKey: '2026-10-25' });
    expect(summary.totalMl).toBe(750);
    expect(summary.goalMl).toBe(2000);
    expect(summary.progressPercent).toBe(37.5);
    expect(summary.remainingMl).toBe(1250);
    expect(summary.excessMl).toBe(0);
    expect(summary.goalMet).toBe(false);
    expect(summary.entryCount).toBe(2);
  });

  it('reports goal met exactly and excess above the goal', () => {
    const exact = selectDailySummary(
      makeState({ entriesByDay: { '2026-10-25': [makeEntry({ volumeMl: 2000 })] } }),
      { dayKey: '2026-10-25' }
    );
    expect(exact.goalMet).toBe(true);
    expect(exact.excessMl).toBe(0);

    const over = selectDailySummary(
      makeState({ entriesByDay: { '2026-10-25': [makeEntry({ volumeMl: 2250 })] } }),
      { dayKey: '2026-10-25' }
    );
    expect(over.progressPercent).toBe(112.5);
    expect(over.remainingMl).toBe(0);
    expect(over.excessMl).toBe(250);
    expect(over.goalMet).toBe(true);
  });

  it('resolves historical goals per day', () => {
    const state = makeState({
      goalHistory: [
        makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2000 }),
        makeGoalChange({ effectiveFrom: '2026-10-25', goalMl: 2500 }),
      ],
      entriesByDay: {
        '2026-10-24': [makeEntry({ id: 'old', dayKey: '2026-10-24', volumeMl: 2500 })],
      },
    });

    expect(selectDailySummary(state, { dayKey: '2026-10-24' }).goalMl).toBe(2000);
    expect(selectDailySummary(state, { dayKey: '2026-10-24' }).goalMet).toBe(true);
    expect(selectDailySummary(state, { dayKey: '2026-10-25' }).goalMl).toBe(2500);
    expect(selectDailySummary(state, { dayKey: '2026-10-19' }).goalMl).toBe(2000);
  });
});
