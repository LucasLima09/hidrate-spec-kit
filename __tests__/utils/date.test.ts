import {
  dayKeyFromDate,
  formatDate,
  formatTime,
  lastSevenDayKeys,
  localTimeFromDate,
  millisecondsUntilNextLocalMidnight,
} from '@/utils/date';

describe('date utilities', () => {
  it('derives the local day key near midnight without using UTC', () => {
    const lateNight = new Date(2026, 0, 5, 23, 59, 0);
    expect(dayKeyFromDate(lateNight)).toBe('2026-01-05');

    const earlyMorning = new Date(2026, 0, 6, 0, 1, 0);
    expect(dayKeyFromDate(earlyMorning)).toBe('2026-01-06');
  });

  it('formats local time as HH:mm', () => {
    expect(localTimeFromDate(new Date(2026, 9, 25, 8, 5, 0))).toBe('08:05');
    expect(formatTime('23:59')).toBe('23:59');
  });

  it('builds exactly seven consecutive local days across year boundaries', () => {
    const keys = lastSevenDayKeys(new Date(2026, 0, 3, 12, 0, 0));
    expect(keys).toEqual([
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
    expect(new Set(keys).size).toBe(7);
  });

  it('builds a seven day window across month boundaries', () => {
    const keys = lastSevenDayKeys(new Date(2026, 2, 2, 12, 0, 0));
    expect(keys).toEqual([
      '2026-02-24',
      '2026-02-25',
      '2026-02-26',
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ]);
  });

  it('formats a day key in pt-BR', () => {
    expect(formatDate('2026-10-25')).toContain('25/10');
    expect(formatDate('2026-10-25')).not.toContain('.');
  });

  it('calculates milliseconds until the next local midnight', () => {
    expect(millisecondsUntilNextLocalMidnight(new Date(2026, 9, 25, 23, 59, 30))).toBe(30000);
    expect(millisecondsUntilNextLocalMidnight(new Date(2026, 9, 25, 12, 0, 0))).toBe(43200000);
  });
});
