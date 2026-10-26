import type { WaterState } from '@/domain/entities';
import type { AppError, Result } from '@/domain/errors';

export interface LoadResult {
  state: WaterState;
  warning: AppError | null;
}

export interface WaterRepository {
  load(): Promise<Result<LoadResult>>;
  save(state: WaterState): Promise<Result<void>>;
  backupCorrupt(raw: string, timestampMs: number): Promise<Result<void>>;
}
