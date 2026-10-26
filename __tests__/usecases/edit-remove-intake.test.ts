import { editIntake } from '@/usecases/edit-intake';
import { removeIntake } from '@/usecases/remove-intake';
import { FIXED_NOW, makeEntry, makeState } from '../helpers/fixtures';

function stateWithEntries() {
  return makeState({
    entriesByDay: {
      '2026-10-25': [
        makeEntry({ id: 'first', volumeMl: 250, localTime: '10:00' }),
        makeEntry({ id: 'second', volumeMl: 500, localTime: '11:00' }),
      ],
      '2026-10-24': [makeEntry({ id: 'yesterday', dayKey: '2026-10-24', volumeMl: 300 })],
    },
  });
}

describe('editIntake', () => {
  it('edits only the volume and preserves day, createdAt and localTime', () => {
    const state = stateWithEntries();
    const result = editIntake(state, { entryId: 'first', volumeMl: 300, now: FIXED_NOW });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const updated = result.value.entry;
    expect(updated.volumeMl).toBe(300);
    expect(updated.dayKey).toBe('2026-10-25');
    expect(updated.localTime).toBe('10:00');
    expect(updated.createdAt).toBe(makeEntry({ id: 'first' }).createdAt);
    expect(state.entriesByDay['2026-10-25'][0].volumeMl).toBe(250);
  });

  it.each([0, -1, 1.5, 5001])('rejects invalid volume %s', (volumeMl) => {
    const state = stateWithEntries();
    const result = editIntake(state, { entryId: 'first', volumeMl, now: FIXED_NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_VOLUME');
    }
    expect(state).toEqual(stateWithEntries());
  });

  it('rejects missing and other-day entries', () => {
    const state = stateWithEntries();
    const missing = editIntake(state, { entryId: 'missing', volumeMl: 300, now: FIXED_NOW });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error.code).toBe('ENTRY_NOT_FOUND');
    }

    const otherDay = editIntake(state, {
      entryId: 'yesterday',
      volumeMl: 300,
      now: FIXED_NOW,
    });
    expect(otherDay.ok).toBe(false);
    if (!otherDay.ok) {
      expect(otherDay.error.code).toBe('ENTRY_NOT_EDITABLE');
    }
  });
});

describe('removeIntake', () => {
  it('removes an entry and keeps the day key while others remain', () => {
    const state = stateWithEntries();
    const result = removeIntake(state, { entryId: 'first', now: FIXED_NOW });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state.entriesByDay['2026-10-25'].map((entry) => entry.id)).toEqual([
        'second',
      ]);
    }
    expect(state.entriesByDay['2026-10-25']).toHaveLength(2);
  });

  it('deletes the day key when the last entry is removed', () => {
    const state = makeState({
      entriesByDay: { '2026-10-25': [makeEntry({ id: 'only' })] },
    });
    const result = removeIntake(state, { entryId: 'only', now: FIXED_NOW });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state.entriesByDay['2026-10-25']).toBeUndefined();
    }
  });

  it('rejects missing and other-day entries', () => {
    const state = stateWithEntries();
    const missing = removeIntake(state, { entryId: 'missing', now: FIXED_NOW });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error.code).toBe('ENTRY_NOT_FOUND');
    }

    const otherDay = removeIntake(state, { entryId: 'yesterday', now: FIXED_NOW });
    expect(otherDay.ok).toBe(false);
    if (!otherDay.ok) {
      expect(otherDay.error.code).toBe('ENTRY_NOT_EDITABLE');
    }
  });
});
