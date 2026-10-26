import { DEFAULT_GOAL_ML } from '@/constants/hydration';
import { makeEntry, makeGoalChange, makeState } from '../helpers/fixtures';
import { createInitialState, normalizeState } from '@/storage/schema';
import { deserialize, serialize } from '@/storage/serializer';

describe('storage schema', () => {
  it('creates the initial state with the default goal', () => {
    expect(createInitialState()).toEqual({
      schemaVersion: 1,
      settings: { defaultGoalMl: DEFAULT_GOAL_ML },
      goalHistory: [],
      entriesByDay: {},
    });
  });

  it('round-trips a valid state', () => {
    const state = makeState({
      goalHistory: [makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2500 })],
      entriesByDay: { '2026-10-25': [makeEntry()] },
    });
    const result = deserialize(serialize(state));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(state);
    }
  });

  it('rejects invalid JSON as corrupted', () => {
    expect(deserialize('{not json').ok).toBe(false);
    expect(deserialize('null').ok).toBe(false);
    expect(deserialize('[]').ok).toBe(false);
  });

  it('rejects an unknown schema version', () => {
    const result = normalizeState({ ...createInitialState(), schemaVersion: 2 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('STORAGE_CORRUPTED');
    }
  });

  it('rejects invalid goal history order, duplicates and default mismatch', () => {
    expect(
      normalizeState(
        makeState({
          goalHistory: [
            makeGoalChange({ effectiveFrom: '2026-10-25', goalMl: 2500 }),
            makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2000 }),
          ],
        })
      ).ok
    ).toBe(false);

    expect(
      normalizeState(
        makeState({
          goalHistory: [
            makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2500 }),
            makeGoalChange({ effectiveFrom: '2026-10-20', goalMl: 2500 }),
          ],
        })
      ).ok
    ).toBe(false);

    expect(
      normalizeState({
        ...makeState(),
        settings: { defaultGoalMl: 2500 },
      }).ok
    ).toBe(false);
  });

  it('rejects invalid entry fields and duplicate ids', () => {
    const base = makeState({ entriesByDay: { '2026-10-25': [makeEntry()] } });

    expect(
      normalizeState({
        ...base,
        entriesByDay: { '2026-10-25': [{ ...makeEntry(), volumeMl: 0 }] },
      }).ok
    ).toBe(false);

    expect(
      normalizeState({
        ...base,
        entriesByDay: { '2026-10-25': [{ ...makeEntry(), dayKey: '2026-10-24' }] },
      }).ok
    ).toBe(false);

    expect(
      normalizeState({
        ...base,
        entriesByDay: { '2026-10-25': [{ ...makeEntry(), localTime: '24:00' }] },
      }).ok
    ).toBe(false);

    expect(
      normalizeState({
        ...base,
        entriesByDay: {
          '2026-10-25': [makeEntry({ id: 'same' })],
          '2026-10-24': [makeEntry({ id: 'same', dayKey: '2026-10-24' })],
        },
      }).ok
    ).toBe(false);
  });

  it('normalizes empty day arrays and sorts entries by createdAt', () => {
    const later = makeEntry({ id: 'later', createdAt: '2026-10-25T18:00:00.000Z' });
    const earlier = makeEntry({ id: 'earlier', createdAt: '2026-10-25T10:00:00.000Z' });

    const result = normalizeState({
      ...makeState(),
      entriesByDay: {
        '2026-10-25': [later, earlier],
        '2026-10-24': [],
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.entriesByDay['2026-10-24']).toBeUndefined();
      expect(result.value.entriesByDay['2026-10-25'].map((entry) => entry.id)).toEqual([
        'earlier',
        'later',
      ]);
    }
  });

  it('drops unknown fields during normalization', () => {
    const result = normalizeState({
      ...makeState({ entriesByDay: { '2026-10-25': [makeEntry()] } }),
      unknownRoot: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.keys(result.value)).toEqual([
        'schemaVersion',
        'settings',
        'goalHistory',
        'entriesByDay',
      ]);
      expect(Object.keys(result.value.entriesByDay['2026-10-25'][0])).toEqual([
        'id',
        'dayKey',
        'createdAt',
        'localTime',
        'volumeMl',
      ]);
    }
  });
});
