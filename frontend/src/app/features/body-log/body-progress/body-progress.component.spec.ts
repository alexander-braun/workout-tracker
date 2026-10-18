import { describe, expect, it } from 'vitest';
import { getMeasurementChangeColor } from './body-progress.component';

describe('Body Progress change colors', () => {
  const muscleMeasurements = [
    'chest',
    'bicepsLeft',
    'bicepsRight',
    'thighLeft',
    'thighRight',
    'calfLeft',
    'calfRight',
  ] as const;

  it.each(muscleMeasurements)('uses green for %s increases and red for decreases', (key) => {
    expect(getMeasurementChangeColor(key, 1)).toBe('positive');
    expect(getMeasurementChangeColor(key, -1)).toBe('negative');
  });

  it('reverses colors for waist measurements', () => {
    expect(getMeasurementChangeColor('waist', 1)).toBe('negative');
    expect(getMeasurementChangeColor('waist', -1)).toBe('positive');
  });

  it.each(['weight', 'neck'] as const)('keeps %s changes neutral', (key) => {
    expect(getMeasurementChangeColor(key, 1)).toBe('neutral');
    expect(getMeasurementChangeColor(key, -1)).toBe('neutral');
  });

  it.each([...muscleMeasurements, 'waist', 'weight', 'neck'] as const)(
    'keeps unchanged %s measurements neutral',
    (key) => {
      expect(getMeasurementChangeColor(key, 0)).toBe('neutral');
    },
  );
});
