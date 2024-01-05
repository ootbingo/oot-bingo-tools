/**
 * Sort the entries of a key/value object.
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
