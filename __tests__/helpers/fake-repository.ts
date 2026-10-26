import type { WaterState } from '@/domain/entities';
import { appError, fail, ok, type AppError, type Result } from '@/domain/errors';
import type { LoadResult, WaterRepository } from '@/storage/repository';
import { createInitialState } from '@/storage/schema';

export class FakeRepository implements WaterRepository {
  state: WaterState;
  loadWarning: AppError | null = null;
  loadError: AppError | null = null;
  saveError: AppError | null = null;
  backupError: AppError | null = null;
  loadCalls = 0;
  saveCalls = 0;
  backupCalls = 0;
  saveGate: Promise<void> | null = null;

  constructor(state: WaterState = createInitialState()) {
    this.state = state;
  }

  async load(): Promise<Result<LoadResult>> {
    this.loadCalls += 1;
    if (this.loadError) {
      return { ok: false, error: this.loadError };
    }
    return ok({ state: this.state, warning: this.loadWarning });
  }

  async save(state: WaterState): Promise<Result<void>> {
    this.saveCalls += 1;
    if (this.saveGate) {
      await this.saveGate;
    }
    if (this.saveError) {
      return { ok: false, error: this.saveError };
    }
    this.state = state;
    return ok(undefined);
  }

  async backupCorrupt(raw: string, timestampMs: number): Promise<Result<void>> {
    this.backupCalls += 1;
    if (this.backupError) {
      return { ok: false, error: this.backupError };
    }
    return ok(undefined);
  }
}

export function failingRepository(error: AppError = appError('STORAGE_ERROR')): WaterRepository {
  return {
    async load() {
      return fail('STORAGE_ERROR');
    },
    async save() {
      return { ok: false, error };
    },
    async backupCorrupt() {
      return { ok: false, error };
    },
  };
}
