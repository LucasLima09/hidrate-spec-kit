export interface AddIntakeInput {
  volumeMl: number;
  now: Date;
  id: string;
}

export interface EditIntakeInput {
  entryId: string;
  volumeMl: number;
  now: Date;
}

export interface RemoveIntakeInput {
  entryId: string;
  now: Date;
}

export interface SetDailyGoalInput {
  goalMl: number;
  now: Date;
}

export interface ResolveGoalInput {
  dayKey: string;
}

export interface SelectDailySummaryInput {
  dayKey: string;
}

export interface SelectWeeklySummaryInput {
  now: Date;
}
