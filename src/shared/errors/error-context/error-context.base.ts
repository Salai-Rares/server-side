export abstract class ErrorContext {
  protected readonly _contextType: string;
  protected readonly _timestamp: Date;

  constructor(contextType: string) {
    this._contextType = contextType;
    this._timestamp = new Date();
  }

  /**
   * Returns the type of context (api, worker, system)
   */
  public getContextType(): string {
    return this._contextType;
  }

  /**
   * Returns when this context was created
   */
  public getTimestamp(): Date {
    return this._timestamp;
  }

  /**
   * Converts context to object suitable for logging
   * Must be implemented by each context type
   */
  public abstract toLogData(): Record<string, any>;

  /**
   * Returns a summary of the context for debugging
   */
  public abstract getSummary(): string;

  /**
   * Custom JSON serialization
   */
  public toJSON(): Record<string, any> {
    return this.toLogData();
  }

  /**
   * String representation
   */
  public toString(): string {
    return this.getSummary();
  }
}