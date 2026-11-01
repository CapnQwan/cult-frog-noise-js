export function fmt(value: number, digits = 4): string {
  if (Number.isNaN(value)) return '–';
  return value.toFixed(digits);
}
