import { resolveGoalForDay } from '@/usecases/resolve-goal-for-day';
import { setDailyGoal } from '@/usecases/set-daily-goal';
import { FIXED_NOW, makeGoalChange, makeState } from '../helpers/fixtures';

describe('setDailyGoal', () => {
  it.each([500, 2500, 10000])('accepts valid goal %s', (goalMl) => {
    const result = setDailyGoal(makeState(), { goalMl, now: FIXED_NOW });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state.settings.defaultGoalMl).toBe(goalMl);
      expect(result.value.state.goalHistory).toEqual([
        { effectiveFrom: '2026-10-25', goalMl },
      ]);
    }
  });

  it.each([499, 10001, 2500.5, '2500'])('rejects invalid goal %s', (goalMl) => {
    const state = makeState();
    const result = setDailyGoal(state, { goalMl: goalMl as number, now: FIXED_NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_GOAL');
    }
    expect(state).toEqual(makeState());
  });

  it('upserts the current day without duplicating entries', () => {
    const state = makeState({
      goalHistory: [makeGoalChange({ effectiveFrom: '2026-10-25', goalMl: 2500 })],
    });

    const result = setDailyGoal(state, { goalMl: 3000, now: FIXED_NOW });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state.goalHistory).toEqual([
        { effectiveFrom: '2026-10-25', goalMl: 3000 },
      ]);
    }
  });

  it('preserves older goals and does not recalculate past days', () => {
    const state = makeState({
      goalHistory: [makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2000 })],
    });

    const result = setDailyGoal(state, { goalMl: 2500, now: FIXED_NOW });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.state.goalHistory).toEqual([
      { effectiveFrom: '2026-10-20', goalMl: 2000 },
      { effectiveFrom: '2026-10-25', goalMl: 2500 },
    ]);
    expect(resolveGoalForDay(result.value.state, { dayKey: '2026-10-19' })).toBe(2000);
    expect(resolveGoalForDay(result.value.state, { dayKey: '2026-10-24' })).toBe(2000);
    expect(resolveGoalForDay(result.value.state, { dayKey: '2026-10-25' })).toBe(2500);
  });

  it('falls back to 2000 for days before the first change', () => {
    const state = makeState({
      goalHistory: [makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 3000 })],
    });
    expect(resolveGoalForDay(state, { dayKey: '2026-10-19' })).toBe(2000);
    expect(resolveGoalForDay(state, { dayKey: '2026-10-20' })).toBe(3000);
  });

  it('does not mutate the previous state', () => {
    const state = makeState({
      goalHistory: [makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2000 })],
    });
    const snapshot = JSON.parse(JSON.stringify(state));
    void setDailyGoal(state, { goalMl: 2500, now: FIXED_NOW });
    expect(state).toEqual(snapshot);
  });
});
