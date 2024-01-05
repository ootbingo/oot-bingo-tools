/**
 * Calculates the sum of an array of numbers
 * @internal
 * @param numbers
 */
export function sum(numbers: number[]) {
  return numbers.reduce((total, currentValue) => total + currentValue, 0);
}

/**
 * Calculates the average of an array of numbers
 * @internal
 * @param numbers
 */
export function average(numbers: number[]) {
  return sum(numbers) / numbers.length;
}

/**
 * Rounds a number to a certain amount of decimals
 * @param number
 * @param decimals Number of decimals that the number should be rounded to
 */
export function roundToDecimals(number: number, decimals: number = 3): number {
  if (isNaN(number) || isNaN(decimals) || decimals < 0) {
    return NaN;
  }
  const multiplier = 10 ** decimals;
  return Math.round(number * multiplier) / multiplier;
}

/**
 * Capitalizes the first letter of a string
 * @param string
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Sorts the entries of a key/value object.
 * Note that the order of an object is never actually guaranteed,
 * but this should work for all cases where you use for...in loops, or call Object.keys(), Object.values(), or Object.entries().
 * @param object A key/value object
 * @param sortFn A function taking two key/value pairs, defining the sort order by returning a number. If the number is
 * negative, a is less than b. If the number is positive, a is greater than b. If the number is zero, a is equal to b.
 */
export function sortObject<TValue>(
  object: { [key: string]: TValue },
  sortFn: (
    a: { key: string; value: TValue },
    b: { key: string; value: TValue },
  ) => number,
) {
  return Object.fromEntries(
    Object.entries(object).sort((a, b) =>
      sortFn({ key: a[0], value: a[1] }, { key: b[0], value: b[1] }),
    ),
  );
}
