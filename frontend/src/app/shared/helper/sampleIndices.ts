export function sampleIndices(length: number, maxPoints = 6): number[] {
  if (!Number.isInteger(maxPoints) || maxPoints < 2) {
    throw new RangeError('maxPoints must be at least 2');
  }

  if (length <= maxPoints) {
    return Array.from({ length }, (_, index) => index);
  }

  return Array.from({ length: maxPoints }, (_, index) =>
    Math.round((index * (length - 1)) / (maxPoints - 1)),
  );
}
