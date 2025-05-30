import { ErrorContext } from "./error-context.base";

export interface WorkerContextData {
  workerId?: string;
  jobId?: string;
  jobType?: string;
  queueName?: string;
  retryCount?: number;
  maxRetries?: number;
  processingStartTime?: Date;
  priority?: number;
  jobData?: any; // Will be sanitized in logs
  parentJobId?: string;
  delayMs?: number;
}

export class WorkerErrorContext extends ErrorContext {
  private readonly _workerId?: string;
  private readonly _jobId?: string;
  private readonly _jobType?: string;
  private readonly _queueName?: string;
  private readonly _retryCount?: number;
  private readonly _maxRetries?: number;
  private readonly _processingStartTime?: Date;
  private readonly _priority?: number;
  private readonly _jobData?: any;
  private readonly _parentJobId?: string;
  private readonly _delayMs?: number;

  constructor(data: WorkerContextData = {}) {
    super('worker');
    this._workerId = data.workerId;
    this._jobId = data.jobId;
    this._jobType = data.jobType;
    this._queueName = data.queueName;
    this._retryCount = data.retryCount;
    this._maxRetries = data.maxRetries;
    this._processingStartTime = data.processingStartTime;
    this._priority = data.priority;
    this._jobData = data.jobData;
    this._parentJobId = data.parentJobId;
    this._delayMs = data.delayMs;
  }

  // Getters
  public get workerId(): string | undefined { return this._workerId; }
  public get jobId(): string | undefined { return this._jobId; }
  public get jobType(): string | undefined { return this._jobType; }
  public get queueName(): string | undefined { return this._queueName; }
  public get retryCount(): number | undefined { return this._retryCount; }
  public get maxRetries(): number | undefined { return this._maxRetries; }
  public get processingDuration(): number | undefined {
    return this._processingStartTime ? Date.now() - this._processingStartTime.getTime() : undefined;
  }

  public toLogData(): Record<string, any> {
    return {
      contextType: this._contextType,
      timestamp: this._timestamp.toISOString(),
      workerId: this._workerId,
      jobId: this._jobId,
      jobType: this._jobType,
      queueName: this._queueName,
      retryCount: this._retryCount,
      maxRetries: this._maxRetries,
      processingStartTime: this._processingStartTime?.toISOString(),
      processingDuration: this.processingDuration,
      priority: this._priority,
      parentJobId: this._parentJobId,
      delayMs: this._delayMs,
      // Sanitize job data - remove sensitive fields
      jobData: this.sanitizeJobData(this._jobData),
    };
  }

  public getSummary(): string {
    const parts = [
      this._jobType && `job:${this._jobType}`,
      this._jobId && `id:${this._jobId}`,
      this._queueName && `queue:${this._queueName}`,
      this._retryCount !== undefined && `retry:${this._retryCount}/${this._maxRetries || '?'}`,
    ].filter(Boolean);

    return `Worker Context(${parts.join(', ')})`;
  }

  private sanitizeJobData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization', 'credentials'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Creates worker context from Bull job
   */
  static fromBullJob(job: any, workerId?: string): WorkerErrorContext {
    return new WorkerErrorContext({
      workerId: workerId || `worker-${process.pid}`,
      jobId: job.id?.toString(),
      jobType: job.name,
      queueName: job.queue?.name,
      retryCount: job.attemptsMade || 0,
      maxRetries: job.opts?.attempts || 3,
      processingStartTime: job.processedOn ? new Date(job.processedOn) : new Date(),
      priority: job.opts?.priority,
      jobData: job.data,
      parentJobId: job.parentId?.toString(),
      delayMs: job.opts?.delay,
    });
  }
}