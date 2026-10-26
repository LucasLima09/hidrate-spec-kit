import {
  parseGoalInput,
  parseIntegerInput,
  parseVolumeInput,
  validateGoalMl,
  validateVolumeMl,
} from '@/utils/validation';

describe('validation utilities', () => {
  it('parses only integer input', () => {
    expect(parseIntegerInput('250')).toBe(250);
    expect(parseIntegerInput(' 250 ')).toBe(250);
    expect(parseIntegerInput('')).toBeNull();
    expect(parseIntegerInput('1,5')).toBeNull();
    expect(parseIntegerInput('1.5')).toBeNull();
    expect(parseIntegerInput('-1')).toBeNull();
    expect(parseIntegerInput('abc')).toBeNull();
  });

  it('accepts volume boundaries', () => {
    expect(validateVolumeMl(1).ok).toBe(true);
    expect(validateVolumeMl(5000).ok).toBe(true);
    expect(validateVolumeMl(0).ok).toBe(false);
    expect(validateVolumeMl(-1).ok).toBe(false);
    expect(validateVolumeMl(1.5).ok).toBe(false);
    expect(validateVolumeMl(5001).ok).toBe(false);
    expect(validateVolumeMl('250' as unknown).ok).toBe(false);
  });

  it('rejects invalid volume text and keeps domain messages', () => {
    const empty = parseVolumeInput('');
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error.code).toBe('INVALID_VOLUME');
      expect(empty.error.message).toContain('1 e 5.000');
    }
    expect(parseVolumeInput('5001').ok).toBe(false);
    expect(parseVolumeInput('250').ok).toBe(true);
  });

  it('accepts goal boundaries and rejects invalid values', () => {
    expect(validateGoalMl(500).ok).toBe(true);
    expect(validateGoalMl(10000).ok).toBe(true);
    expect(validateGoalMl(499).ok).toBe(false);
    expect(validateGoalMl(10001).ok).toBe(false);
    expect(validateGoalMl(2500.5).ok).toBe(false);
    expect(parseGoalInput('2500').ok).toBe(true);
    expect(parseGoalInput('texto').ok).toBe(false);
  });
});
