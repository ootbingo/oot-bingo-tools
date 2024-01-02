export function sum(numbers: number[]) {
  return numbers.reduce((total, currentValue) => total + currentValue, 0);
}

export function average(numbers: number[]) {
  return sum(numbers) / numbers.length;
}
