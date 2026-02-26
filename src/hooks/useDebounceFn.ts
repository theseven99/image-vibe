import { useRef, useEffect, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DebouncedFn<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => void;

/**
 * useDebounceFn hook returns a debounced version of a callback function.
 *
 * @param fn - The function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns A debounced version of the function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): DebouncedFn<T> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay],
  );

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
