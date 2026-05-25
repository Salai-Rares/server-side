// src/shared/utils/retry.ts
import { MongoServerError } from "mongodb";
export function backoffMs(retryCount: number): number {
  const base = 2_000;
  const cap = 5 * 60_000;
  return Math.min(base * 2 ** Math.max(0, retryCount - 1), cap);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    shouldRetry = (error) =>
      error instanceof MongoServerError &&
      error.hasErrorLabel("TransientTransactionError"),
  } = options;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1}`); // 👈 Add this
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries || !shouldRetry(error)) {
        break;
      }

      attempt++;
      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      console.log(`Retrying after error:`); // 👈 And this
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
