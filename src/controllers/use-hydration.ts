import { createContext, useContext } from 'react';

import type { DailySummary, WaterState, WeeklySummary } from '@/domain/entities';
import type { AppError } from '@/domain/errors';

export type HydrationStatus = 'loading' | 'ready' | 'error';

export interface HydrationController {
  status: HydrationStatus;
  state: WaterState | null;
  today: DailySummary | null;
  week: WeeklySummary | null;
  warning: AppError | null;
  isSaving: boolean;
  addIntake(volumeMl: number): Promise<boolean>;
  editIntake(entryId: string, volumeMl: number): Promise<boolean>;
  removeIntake(entryId: string): Promise<boolean>;
  setDailyGoal(goalMl: number): Promise<boolean>;
  retry(): Promise<void>;
  clearWarning(): void;
}

export const HydrationContext = createContext<HydrationController | null>(null);

export function useHydration(): HydrationController {
  const context = useContext(HydrationContext);
  if (!context) {
    throw new Error('useHydration must be used within a HydrationProvider');
  }
  return context;
}
