import { ErrorContext } from "./error-context.base";

export interface ApiContextData {
  requestId?: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  userAgent?: string;
  ip?: string;
  userId?: string | number;
  sessionId?: string;
  correlationId?: string;
  referer?: string;
  origin?: string;
  contentType?: string;
  acceptLanguage?: string;
  authorization?: string; // Will be sanitized in logs
}


export class ApiErrorContext extends ErrorContext {
  private readonly _requestId?: string;
  private readonly _endpoint?: string;
  private readonly _method?: string;
  private readonly _userAgent?: string;
  private readonly _ip?: string;
  private readonly _userId?: string | number;
  private readonly _sessionId?: string;
  private readonly _correlationId?: string;
  private readonly _referer?: string;
  private readonly _origin?: string;
  private readonly _contentType?: string;
  private readonly _acceptLanguage?: string;
  private readonly _authorization?: string;

  constructor(data: ApiContextData = {}) {
    super('api');
    this._requestId = data.requestId;
    this._endpoint = data.endpoint;
    this._method = data.method;
    this._userAgent = data.userAgent;
    this._ip = data.ip;
    this._userId = data.userId;
    this._sessionId = data.sessionId;
    this._correlationId = data.correlationId;
    this._referer = data.referer;
    this._origin = data.origin;
    this._contentType = data.contentType;
    this._acceptLanguage = data.acceptLanguage;
    this._authorization = data.authorization;
  }

  // Getters
  public get requestId(): string | undefined { return this._requestId; }
  public get endpoint(): string | undefined { return this._endpoint; }
  public get method(): string | undefined { return this._method; }
  public get userAgent(): string | undefined { return this._userAgent; }
  public get ip(): string | undefined { return this._ip; }
  public get userId(): string | number | undefined { return this._userId; }
  public get sessionId(): string | undefined { return this._sessionId; }
  public get correlationId(): string | undefined { return this._correlationId; }

  public toLogData(): Record<string, any> {
    return {
      contextType: this._contextType,
      timestamp: this._timestamp.toISOString(),
      requestId: this._requestId,
      endpoint: this._endpoint,
      method: this._method,
      userAgent: this._userAgent,
      ip: this._ip,
      userId: this._userId,
      sessionId: this._sessionId,
      correlationId: this._correlationId,
      referer: this._referer,
      origin: this._origin,
      contentType: this._contentType,
      acceptLanguage: this._acceptLanguage,
      // Sanitize authorization for security
      authorization: this._authorization ? '[REDACTED]' : undefined,
    };
  }

  public getSummary(): string {
    const parts = [
      this._requestId && `req:${this._requestId}`,
      this._endpoint && `${this._method || 'UNKNOWN'} ${this._endpoint}`,
      this._userId && `user:${this._userId}`,
    ].filter(Boolean);

    return `API Context(${parts.join(', ')})`;
  }

}