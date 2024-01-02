export function roundToDecimals(number: number, decimals: number = 3): number {
  if (isNaN(number) || isNaN(decimals) || decimals < 0) {
    return NaN;
  }
  const multiplier = 10 ** decimals;
  return Math.round(number * multiplier) / multiplier;
}
