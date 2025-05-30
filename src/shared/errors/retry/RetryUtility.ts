import { injectable } from "inversify";
import { BaseError } from "../BaseError";
import { RetryConfig, RetryResult } from "./types/retry.interface";

@injectable()
export class RetryUtility {
  private readonly defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => this.isRetryableError(error),
  };

  /**
   * Executes a function with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          result,
          attempts: attempt,
          totalTimeMs: Date.now() - startTime,
          success: true,
        };
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry this error
        if (!finalConfig.retryCondition!(lastError)) {
          break;
        }

        // Don't delay after the last attempt
        if (attempt < finalConfig.maxAttempts) {
          const delayMs = this.calculateDelay(attempt, finalConfig);
          await this.delay(delayMs);
        }
      }
    }

    return {
      error: lastError,
      attempts: finalConfig.maxAttempts,
      totalTimeMs: Date.now() - startTime,
      success: false,
    };
  }

  /**
   * Determines if an error should be retried based on your ApiError system
   */
  private isRetryableError(error: Error): boolean {
    // Check if it's one of your BaseError types
    if (error instanceof BaseError) {
       return error.isRetryable();
    }

    // For non-BaseError types, check common retry conditions
    if (
      error.message.includes("ECONNRESET") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ENOTFOUND")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculates delay with exponential backoff and optional jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay =
      config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

    if (config.jitter) {
      // Add jitter: ±25% of the delay
      const jitterRange = cappedDelay * 0.25;
      const jitter = (Math.random() - 0.5) * 2 * jitterRange;
      return Math.max(0, cappedDelay + jitter);
    }

    return cappedDelay;
  }

  /**
   * Promise-based delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Creates a retry decorator for methods
   */
  withRetry<T extends any[], R>(
    target: (...args: T) => Promise<R>,
    config: Partial<RetryConfig> = {}
  ) {
    return async (...args: T): Promise<R> => {
      const result = await this.executeWithRetry(() => target(...args), config);

      if (result.success) {
        return result.result!;
      } else {
        throw result.error;
      }
    };
  }
}
