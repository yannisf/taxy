/**
 * Wraps a promise with a timeout
 * If the promise doesn't resolve within the timeout, it will be rejected
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}
