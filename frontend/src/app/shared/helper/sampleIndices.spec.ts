
import { describe, expect, it } from 'vitest';
import { sampleIndices } from './sampleIndices';

describe('sampleIndices', () => {
  it.each([0, 1, 5, 6])('keeps all indices for %i points', (count) => {
    expect(sampleIndices(count)).toEqual(
      Array.from({ length: count }, (_, index) => index),
    );
  });

  it('samples 20 points evenly', () => {
    expect(sampleIndices(20)).toEqual([0, 4, 8, 11, 15, 19]);
  });

  it.each([7, 12, 20, 100])('keeps first and last of %i points', (count) => {
    const indices = sampleIndices(count);

    expect(indices).toHaveLength(6);
    expect(indices[0]).toBe(0);
    expect(indices.at(-1)).toBe(count - 1);
    expect(new Set(indices).size).toBe(6);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });

  it('rejects invalid limits', () => {
    expect(() => sampleIndices(20, 1)).toThrow(RangeError);
  });
});
