import { SerializedError } from "../types/serialized-error.types";
import { ErrorContext } from "./error-context/error-context.base";


export abstract class BaseError extends Error {
  protected readonly _statusCode: number;
  private readonly _isOperational: boolean;
  private readonly _cause?: Error;
  private _context?: ErrorContext;
  private readonly _timestamp: Date;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    cause?: Error,
   
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this._statusCode = statusCode;
    this._isOperational = isOperational;
    this._cause = cause;

    this._timestamp = new Date();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
// Abstract methods - must be implemented by subclasses
  public abstract isRetryable(): boolean;
  public abstract getRetryAfterSeconds(): number;
  
  public get statusCode(): number {
    return this._statusCode;
  }

  public get isOperational(): boolean {
    return this._isOperational;
  }

  public get cause(): Error | undefined {
    return this._cause;
  }
  public get context(): ErrorContext | undefined {
    return this._context;
  }

  public get timestamp(): Date {
    return this._timestamp;
  }


  // For logging purposes
  public get fullStack(): string {
    let stack = this.stack || "";

    if (this._cause) {
      stack += `\nCaused by: ${this._cause.stack || this._cause.message}`;
    }

    return stack;
  }

  protected isProductionMode(): boolean {
  // Never show stack traces in production
  return process.env.NODE_ENV === "production";
}

protected shouldShowContext(): boolean {
  // Show context in development, but be selective in production
  return !this.isProductionMode() ? true :  this._isOperational && !!this._context
}
  

  public setContext(context: ErrorContext): void {
    if (!this._context) this._context = context;
  }
  protected shouldHideDetails(): boolean {
    return process.env.NODE_ENV === "production" && !this._isOperational;
  }

  public serialize(): SerializedError {
    const shouldHideDetails = this.shouldHideDetails();
    const shouldShowContext = this.shouldShowContext();
    const shouldShowStack = !this.isProductionMode();
    return {
      success: false,
      error: shouldHideDetails ? "INTERNAL_ERROR" : this.name,
      message: shouldHideDetails ? "Something went wrong" : this.message,
      statusCode: this._statusCode,
      ...(this._context &&
        shouldShowContext && { context: this._context.toLogData() }),
      ...(this.stack &&
        shouldShowStack && {
          stack: this.stack,
          ...(this._cause && {
            cause: {
              message: this._cause.message,
              stack: this._cause.stack,
            },
          }),
        }),
    };
  }

  public getLogData(): Record<string, any> {
    return {
      // Basic error info
      name: this.name,
      message: this.message,
      statusCode: this._statusCode,
      isOperational: this._isOperational,
      timestamp: this._timestamp.toISOString(),

      // Context information
      context: this._context?.toLogData(),

      // Stack trace information
      stack: this.fullStack,

      // Environment info
      environment: process.env.NODE_ENV || "development",
      processId: process.pid,
      nodeVersion: process.version,
    };
  }

    /**
   * Returns a human-readable summary of the error
   * Useful for logging and debugging
   */
  public getSummary(): string {
    const contextInfo = this._context ? ` (${this._context.getContextType()})` : '';
    const operationalStatus = this._isOperational ? 'operational' : 'non-operational';
    return `${this.name}: ${this.message}${contextInfo} [${operationalStatus}]`;
  }

  public debug(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 ${this.name}`);
      console.log('Message:', this.message);
      console.log('Status Code:', this._statusCode);
      console.log('Operational:', this._isOperational);
      console.log('Timestamp:', this._timestamp.toISOString());
      
      if (this._context) {
        console.log('Context:', this._context.getContextType());
        console.log('Context Data:', this._context.toLogData());
      }
      
      if (this._cause) {
        console.log('Cause:', this._cause.message);
      }
      
      console.log('Stack:', this.stack);
      console.groupEnd();
    }
  }

   /**
   * Checks if this error has a specific cause
   */
  public hasCause(): boolean {
    return !!this._cause;
  }

  /**
   * Checks if this error has context information
   */
  public hasContext(): boolean {
    return !!this._context;
  }
}
