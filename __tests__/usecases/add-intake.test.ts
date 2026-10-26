import { addIntake } from '@/usecases/add-intake';
import { makeEntry, makeState, FIXED_NOW } from '../helpers/fixtures';

describe('addIntake', () => {
  it('adds a valid entry to the local day without mutating the state', () => {
    const state = makeState();
    const snapshot = JSON.parse(JSON.stringify(state));

    const result = addIntake(state, { volumeMl: 250, now: FIXED_NOW, id: 'new-entry' });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.entry).toEqual(
      makeEntry({ id: 'new-entry', volumeMl: 250, dayKey: '2026-10-25', localTime: '15:30' })
    );
    expect(result.value.state.entriesByDay['2026-10-25']).toHaveLength(1);
    expect(state).toEqual(snapshot);
  });

  it('accepts boundary volumes 1 and 5000', () => {
    const one = addIntake(makeState(), { volumeMl: 1, now: FIXED_NOW, id: 'one' });
    const max = addIntake(makeState(), { volumeMl: 5000, now: FIXED_NOW, id: 'max' });
    expect(one.ok).toBe(true);
    expect(max.ok).toBe(true);
  });

  it.each([0, -1, 1.5, 5001])('rejects invalid volume %s', (volumeMl) => {
    const state = makeState();
    const result = addIntake(state, { volumeMl, now: FIXED_NOW, id: 'invalid' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_VOLUME');
    }
    expect(state).toEqual(makeState());
  });

  it('appends multiple entries and keeps unique injected ids', () => {
    const first = addIntake(makeState(), { volumeMl: 250, now: FIXED_NOW, id: 'first' });
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }
    const second = addIntake(first.value.state, {
      volumeMl: 500,
      now: new Date(2026, 9, 25, 16, 0, 0),
      id: 'second',
    });
    expect(second.ok).toBe(true);
    if (!second.ok) {
      return;
    }
    expect(second.value.state.entriesByDay['2026-10-25'].map((entry) => entry.id)).toEqual([
      'first',
      'second',
    ]);
  });

  it('derives the day key from local date near midnight', () => {
    const result = addIntake(makeState(), {
      volumeMl: 250,
      now: new Date(2026, 9, 25, 23, 59, 0),
      id: 'late',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.entry.dayKey).toBe('2026-10-25');
      expect(result.value.entry.localTime).toBe('23:59');
    }
  });
});
