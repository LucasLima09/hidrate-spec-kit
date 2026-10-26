import { STORAGE_KEY } from '@/constants/hydration';
import { AsyncStorageWaterRepository, type StorageLike } from '@/storage/async-storage-repository';
import { createInitialState } from '@/storage/schema';
import { serialize } from '@/storage/serializer';
import { makeEntry, makeState } from '../helpers/fixtures';

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  setItemCalls: { key: string; value: string }[] = [];
  inFlight = 0;
  maxInFlight = 0;
  failGet = false;
  failSet = false;
  delayMs = 0;

  async getItem(key: string): Promise<string | null> {
    if (this.failGet) {
      throw new Error('read failed');
    }
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.inFlight += 1;
    this.maxInFlight = Math.max(this.maxInFlight, this.inFlight);
    try {
      if (this.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
      if (this.failSet) {
        throw new Error('write failed');
      }
      this.setItemCalls.push({ key, value });
      this.values.set(key, value);
    } finally {
      this.inFlight -= 1;
    }
  }
}

describe('AsyncStorageWaterRepository', () => {
  it('returns the initial state when nothing is stored', async () => {
    const storage = new MemoryStorage();
    const repository = new AsyncStorageWaterRepository(storage);

    const result = await repository.load();
    expect(result).toEqual({ ok: true, value: { state: createInitialState(), warning: null } });
  });

  it('round-trips a valid document', async () => {
    const storage = new MemoryStorage();
    const state = makeState({
      entriesByDay: { '2026-10-25': [makeEntry()] },
    });
    storage.values.set(STORAGE_KEY, serialize(state));
    const repository = new AsyncStorageWaterRepository(storage);

    const result = await repository.load();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state).toEqual(state);
      expect(result.value.warning).toBeNull();
    }
  });

  it('backs up invalid JSON and returns a corrupted warning', async () => {
    const storage = new MemoryStorage();
    storage.values.set(STORAGE_KEY, '{broken');
    const repository = new AsyncStorageWaterRepository(storage);

    const result = await repository.load();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state).toEqual(createInitialState());
      expect(result.value.warning?.code).toBe('STORAGE_CORRUPTED');
    }
    const backup = storage.setItemCalls.find((call) => call.key.startsWith('@hidrate/state:corrupt:'));
    expect(backup?.value).toBe('{broken');
    expect(storage.values.get(STORAGE_KEY)).toBe('{broken');
  });

  it('returns a storage error when the backup fails', async () => {
    const storage = new MemoryStorage();
    storage.values.set(STORAGE_KEY, '{"schemaVersion":99}');
    storage.failSet = true;
    const repository = new AsyncStorageWaterRepository(storage);

    const result = await repository.load();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state).toEqual(createInitialState());
      expect(result.value.warning?.code).toBe('STORAGE_ERROR');
    }
  });

  it('reports read failures as STORAGE_ERROR', async () => {
    const storage = new MemoryStorage();
    storage.failGet = true;
    const repository = new AsyncStorageWaterRepository(storage);

    const result = await repository.load();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('STORAGE_ERROR');
    }
  });

  it('writes a valid state exactly as serialized', async () => {
    const storage = new MemoryStorage();
    const repository = new AsyncStorageWaterRepository(storage);
    const state = makeState({ entriesByDay: { '2026-10-25': [makeEntry()] } });

    const result = await repository.save(state);
    expect(result.ok).toBe(true);
    expect(storage.values.get(STORAGE_KEY)).toBe(serialize(state));
  });

  it('does not write an invalid state', async () => {
    const storage = new MemoryStorage();
    const repository = new AsyncStorageWaterRepository(storage);
    const invalid = {
      ...createInitialState(),
      entriesByDay: { '2026-10-25': [makeEntry({ volumeMl: 0 })] },
    };

    const result = await repository.save(invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('STORAGE_ERROR');
    }
    expect(storage.setItemCalls).toHaveLength(0);
  });

  it('reports write failures without changing the stored value', async () => {
    const storage = new MemoryStorage();
    const repository = new AsyncStorageWaterRepository(storage);
    const state = makeState();
    storage.values.set(STORAGE_KEY, serialize(state));
    storage.failSet = true;

    const result = await repository.save(
      makeState({ entriesByDay: { '2026-10-25': [makeEntry()] } })
    );
    expect(result.ok).toBe(false);
    expect(storage.values.get(STORAGE_KEY)).toBe(serialize(state));
  });

  it('serializes concurrent writes and keeps the last state', async () => {
    const storage = new MemoryStorage();
    storage.delayMs = 10;
    const repository = new AsyncStorageWaterRepository(storage);

    const first = makeState({ entriesByDay: { '2026-10-25': [makeEntry({ id: 'first' })] } });
    const second = makeState({ entriesByDay: { '2026-10-25': [makeEntry({ id: 'second' })] } });

    await Promise.all([repository.save(first), repository.save(second)]);

    expect(storage.maxInFlight).toBe(1);
    expect(storage.values.get(STORAGE_KEY)).toBe(serialize(second));
  });
});
