import type { DayKey } from '@/domain/entities';

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function dayKeyFromDate(date: Date): DayKey {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

export function localTimeFromDate(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isDayKey(value: unknown): value is DayKey {
  return typeof value === 'string' && DAY_KEY_PATTERN.test(value);
}

export function isLocalTime(value: unknown): value is string {
  return typeof value === 'string' && LOCAL_TIME_PATTERN.test(value);
}

export function dayKeyToLocalDate(dayKey: DayKey): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function lastSevenDayKeys(now: Date): DayKey[] {
  const keys: DayKey[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset, 12, 0, 0, 0);
    keys.push(dayKeyFromDate(date));
  }
  return keys;
}

export function formatDate(dayKey: DayKey): string {
  const date = dayKeyToLocalDate(dayKey);
  return date
    .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
    .replace(/\./g, '');
}

export function formatTime(localTime: string): string {
  return localTime;
}

export function millisecondsUntilNextLocalMidnight(now: Date): number {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  ).getTime();
  return Math.max(0, nextMidnight - now.getTime());
}
