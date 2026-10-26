export type DayKey = string;

export interface IntakeEntry {
  id: string;
  dayKey: DayKey;
  createdAt: string;
  localTime: string;
  volumeMl: number;
}

export interface GoalChange {
  effectiveFrom: DayKey;
  goalMl: number;
}

export interface AppSettings {
  defaultGoalMl: number;
}

export interface WaterState {
  schemaVersion: 1;
  settings: AppSettings;
  goalHistory: GoalChange[];
  entriesByDay: Record<DayKey, IntakeEntry[]>;
}

export interface DailySummary {
  dayKey: DayKey;
  totalMl: number;
  goalMl: number;
  progressPercent: number;
  remainingMl: number;
  excessMl: number;
  goalMet: boolean;
  entryCount: number;
}

export interface WeeklySummary {
  days: DailySummary[];
  daysWithGoalMet: number;
}
