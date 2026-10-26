import AsyncStorage from '@react-native-async-storage/async-storage';

import { CORRUPT_KEY_PREFIX, STORAGE_KEY } from '@/constants/hydration';
import type { WaterState } from '@/domain/entities';
import { appError, fail, ok, type Result } from '@/domain/errors';
import type { LoadResult, WaterRepository } from '@/storage/repository';
import { createInitialState, normalizeState } from '@/storage/schema';
import { deserialize, serialize } from '@/storage/serializer';

export type StorageLike = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;

export class AsyncStorageWaterRepository implements WaterRepository {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly storage: StorageLike = AsyncStorage) {}

  async load(): Promise<Result<LoadResult>> {
    let raw: string | null;
    try {
      raw = await this.storage.getItem(STORAGE_KEY);
    } catch {
      return fail('STORAGE_ERROR');
    }

    if (raw === null) {
      return ok({ state: createInitialState(), warning: null });
    }

    const result = deserialize(raw);
    if (result.ok) {
      return ok({ state: result.value, warning: null });
    }

    const backup = await this.backupCorrupt(raw, Date.now());
    if (!backup.ok) {
      return ok({
        state: createInitialState(),
        warning: appError(
          'STORAGE_ERROR',
          'Não foi possível preservar os dados antigos. O app iniciou com dados vazios.'
        ),
      });
    }

    return ok({ state: createInitialState(), warning: appError('STORAGE_CORRUPTED') });
  }

  save(state: WaterState): Promise<Result<void>> {
    const normalized = normalizeState(state);
    if (!normalized.ok) {
      return Promise.resolve(
        fail('STORAGE_ERROR', 'Estado inválido. Nenhum dado foi gravado.')
      );
    }

    const operation = this.queue.then(() => this.write(normalized.value));
    this.queue = operation.then(
      () => undefined,
      () => undefined
    );
    return operation;
  }

  async backupCorrupt(raw: string, timestampMs: number): Promise<Result<void>> {
    try {
      await this.storage.setItem(`${CORRUPT_KEY_PREFIX}${timestampMs}`, raw);
      return ok(undefined);
    } catch {
      return fail('STORAGE_ERROR', 'Não foi possível criar o backup dos dados antigos.');
    }
  }

  private async write(state: WaterState): Promise<Result<void>> {
    try {
      await this.storage.setItem(STORAGE_KEY, serialize(state));
      return ok(undefined);
    } catch {
      return fail('STORAGE_ERROR');
    }
  }
}

export const waterRepository = new AsyncStorageWaterRepository();
