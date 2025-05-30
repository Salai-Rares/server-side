export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryContext {
  attempt: number;
  totalAttempts: number;
  lastError?: Error;
  elapsedMs: number;
}

export interface RetryResult<T> {
  result?: T;
  error?: Error;
  attempts: number;
  totalTimeMs: number;
  success: boolean;
}