export function formatVolume(volumeMl: number): string {
  if (volumeMl < 1000) {
    return `${volumeMl} ml`;
  }
  const liters = (volumeMl / 1000).toFixed(1).replace('.', ',');
  return `${liters} L`;
}

export function formatPercent(progressPercent: number): string {
  return `${Math.round(progressPercent)}%`;
}

export function progressBarPercent(progressPercent: number): number {
  if (!Number.isFinite(progressPercent)) {
    return 0;
  }
  return Math.min(100, Math.max(0, progressPercent));
}
