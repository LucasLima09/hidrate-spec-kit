import { formatPercent, formatVolume, progressBarPercent } from '@/utils/volume';

describe('volume utilities', () => {
  it('formats values below one liter in milliliters', () => {
    expect(formatVolume(0)).toBe('0 ml');
    expect(formatVolume(999)).toBe('999 ml');
  });

  it('formats values at or above one liter in liters with one decimal comma', () => {
    expect(formatVolume(1000)).toBe('1,0 L');
    expect(formatVolume(1500)).toBe('1,5 L');
    expect(formatVolume(2000)).toBe('2,0 L');
    expect(formatVolume(2500)).toBe('2,5 L');
  });

  it('rounds percentages for display', () => {
    expect(formatPercent(12.5)).toBe('13%');
    expect(formatPercent(100)).toBe('100%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('caps progress bars between 0 and 100', () => {
    expect(progressBarPercent(-10)).toBe(0);
    expect(progressBarPercent(50)).toBe(50);
    expect(progressBarPercent(150)).toBe(100);
    expect(progressBarPercent(Number.NaN)).toBe(0);
  });
});
