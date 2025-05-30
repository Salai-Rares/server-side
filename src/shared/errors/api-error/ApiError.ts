import { ErrorType, HttpStatus } from "@/constants";
import { BaseError } from "../BaseError";
import { SerializedError } from "../../types/serialized-error.types";
import { ApiErrorContext } from "../error-context/api-error-context";
import { ErrorContext } from "../error-context/error-context.base";

export class ApiError extends BaseError {
  private readonly _details?: any;
  private readonly _errorType: ErrorType;

  constructor(
    message: string,
    statusCode: number,
    errorType: ErrorType = ErrorType.UNKNOWN_ERROR,
    details?: any,
    cause?: Error,
    isOperational?: boolean
  ) {
    // API errors: 4xx = operational, 5xx = non-operational by default, but allow override
    const defaultOperational = statusCode < 500;
    super(message, statusCode, isOperational ?? defaultOperational, cause);
    this._details = details;
    this._errorType = errorType;
  }

  // Implement abstract methods
  public isRetryable(): boolean {
    const retryableStatusCodes = [
      HttpStatus.REQUEST_TIMEOUT,
      HttpStatus.TOO_MANY_REQUESTS,
      HttpStatus.INTERNAL_SERVER_ERROR,
      HttpStatus.BAD_GATEWAY,
      HttpStatus.SERVICE_UNAVAILABLE,
      HttpStatus.GATEWAY_TIMEOUT,
    ];
    return this.isOperational && retryableStatusCodes.includes(this.statusCode);
  }

  public getRetryAfterSeconds(): number {
    // Check if details contain retry info
    if (this._details?.retryAfterSeconds) {
      return this._details.retryAfterSeconds;
    }

    // Default delays based on status code
    switch (this.statusCode) {
      case HttpStatus.TOO_MANY_REQUESTS:
        return 60; // Rate limit - wait 1 minute
      case HttpStatus.BAD_GATEWAY:
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 30; // Service issues - wait 30 seconds
      case HttpStatus.GATEWAY_TIMEOUT:
        return 10; // Timeout - retry quicker
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 5; // Server error - retry soon
      default:
        return 1; // Default 1 second
    }
  }
  public get details(): any | undefined {
    return this._details;
  }

  public get errorType(): ErrorType | undefined {
    return this._errorType;
  }

  // Override serialize to include API-specific fields
  public serialize(): SerializedError {
    const base = super.serialize();
    const shouldHideDetails = this.shouldHideDetails();

    return {
      ...base,
      error: this._errorType, // Use errorType instead of class name
      ...(this._details && !shouldHideDetails && { details: this._details }),
    };
  }

  // Override getLogData for API-specific logging fields
  public getLogData(): Record<string, any> {
    const base = super.getLogData();
    return {
      ...base,
      errorType: this._errorType,
      details: this._details,
    };
  }

  // Override setContext to ensure proper context type
  public setContext(context: ErrorContext): void {
    if (context instanceof ApiErrorContext) {
      super.setContext(context);
    } else {
      console.warn("ApiError received non-API context, ignoring");
    }
  }

  // ============= FACTORY METHODS FOR COMMON HTTP ERRORS =============

  /**
   * Creates a 400 Bad Request error
   * @param message Error message
   * @param details Additional error details (validation fields, etc.)
   */
  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(message, 400, ErrorType.VALIDATION_ERROR, details);
  }

  /**
   * Creates a 401 Unauthorized error
   * @param message Error message (default: "Authentication required")
   * @param details Additional error details
   */
  static unauthorized(
    message: string = "Authentication required",
    details?: any
  ): ApiError {
    return new ApiError(message, 401, ErrorType.AUTHENTICATION_ERROR, details);
  }

  /**
   * Creates a 403 Forbidden error
   * @param message Error message (default: "Access denied")
   * @param details Additional error details
   */
  static forbidden(message: string = "Access denied", details?: any): ApiError {
    return new ApiError(message, 403, ErrorType.AUTHORIZATION_ERROR, details);
  }

  /**
   * Creates a 404 Not Found error
   * @param message Error message (default: "Resource not found")
   * @param details Additional error details
   */
  static notFound(
    message: string = "Resource not found",
    details?: any
  ): ApiError {
    return new ApiError(message, 404, ErrorType.NOT_FOUND_ERROR, details);
  }

  /**
   * Creates a 405 Method Not Allowed error
   * @param message Error message
   * @param allowedMethods Array of allowed HTTP methods
   */
  static methodNotAllowed(
    message: string,
    allowedMethods?: string[]
  ): ApiError {
    return new ApiError(message, 405, ErrorType.METHOD_NOT_ALLOWED_ERROR, {
      allowedMethods,
    });
  }

  /**
   * Creates a 409 Conflict error
   * @param message Error message
   * @param details Additional error details
   */
  static conflict(message: string, details?: any): ApiError {
    return new ApiError(message, 409, ErrorType.CONFLICT_ERROR, details);
  }

  /**
   * Creates a 413 Payload Too Large error
   * @param message Error message
   * @param maxSize Maximum allowed size
   */
  static payloadTooLarge(message: string, maxSize?: number): ApiError {
    return new ApiError(message, 413, ErrorType.PAYLOAD_TOO_LARGE_ERROR, {
      maxSize,
    });
  }

  /**
   * Creates a 415 Unsupported Media Type error
   * @param message Error message
   * @param supportedTypes Array of supported media types
   */
  static unsupportedMediaType(
    message: string,
    supportedTypes?: string[]
  ): ApiError {
    return new ApiError(message, 415, ErrorType.UNSUPPORTED_MEDIA_TYPE_ERROR, {
      supportedTypes,
    });
  }

  /**
   * Creates a 422 Unprocessable Entity error
   * @param message Error message
   * @param details Validation details
   */
  static unprocessableEntity(message: string, details?: any): ApiError {
    return new ApiError(message, 422, ErrorType.VALIDATION_ERROR, details);
  }
  /**
   * 429 Too Many Requests - Rate limit exceeded
   */
  static tooManyRequests(
    message: string = "Too many requests",
    retryAfterSeconds?: number,
    cause?: Error
  ): ApiError {
    const details = retryAfterSeconds ? { retryAfterSeconds } : undefined;
    return new ApiError(
      message,
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorType.RATE_LIMIT_ERROR,
      details,
      cause,
      true
    );
  }

  /**
   * Creates a 500 Internal Server Error (non-operational)
   * @param message Error message
   * @param cause Original error that caused this
   * @param details Additional error details
   */
  static internalError(
    message: string,
    cause?: Error,
    details?: any
  ): ApiError {
    return new ApiError(
      message,
      500,
      ErrorType.INTERNAL_ERROR,
      details,
      cause,
      false
    );
  }

  /**
   * Creates a 501 Not Implemented error
   * @param message Error message
   * @param feature Feature that is not implemented
   */
  static notImplemented(message: string, feature?: string): ApiError {
    return new ApiError(message, 501, ErrorType.NOT_IMPLEMENTED_ERROR, {
      feature,
    });
  }

  /**
   * Creates a 502 Bad Gateway error (usually operational)
   * @param message Error message
   * @param service Name of the upstream service
   * @param cause Original error
   */
  static badGateway(
    message: string,
    service?: string,
    cause?: Error
  ): ApiError {
    return new ApiError(
      message,
      502,
      ErrorType.EXTERNAL_SERVICE_ERROR,
      { service },
      cause,
      true
    );
  }

  /**
   * Creates a 503 Service Unavailable error (operational)
   * @param message Error message
   * @param retryAfter Seconds to wait before retrying
   * @param cause Original error
   */
  static serviceUnavailable(
    message: string,
    retryAfter?: number,
    cause?: Error
  ): ApiError {
    return new ApiError(
      message,
      503,
      ErrorType.EXTERNAL_SERVICE_ERROR,
      { retryAfter },
      cause,
      true
    );
  }

  /**
   * 504 Gateway Timeout - Upstream server timeout
   */
  static gatewayTimeout(
    message: string = "Gateway timeout",
    upstreamService?: string,
    timeoutMs?: number,
    cause?: Error
  ): ApiError {
    const details: Record<string, any> = {};
    if (upstreamService) details.upstreamService = upstreamService;
    if (timeoutMs) details.timeoutMs = timeoutMs;

    return new ApiError(
      message,
      HttpStatus.GATEWAY_TIMEOUT,
      ErrorType.TIMEOUT_ERROR,
      Object.keys(details).length > 0 ? details : undefined,
      cause,
      true // Timeout errors are usually operational (can retry)
    );
  }

  // ============= SPECIALIZED FACTORY METHODS =============
  static databaseError(operation: string, cause?: Error): ApiError {
    return new ApiError(
      `Database operation failed: ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorType.DATABASE_ERROR,
      { operation },
      cause,
      false // Database errors are usually non-operational
    );
  }

  /**
   * Creates a business rule violation error
   * @param message Error message
   * @param rule The business rule that was violated
   * @param context Additional context about the violation
   */
  static businessRuleViolation(
    message: string,
    rule: string,
    context?: any
  ): ApiError {
    return new ApiError(message, 400, ErrorType.BUSINESS_RULE_ERROR, {
      rule,
      context,
      type: "business_rule_violation",
    });
  }

  /**
   * Creates a security violation error (non-operational to hide details)
   * @param message Generic error message (don't expose attack details)
   * @param cause Original error (for logging)
   */
  static securityViolation(message: string, cause?: Error): ApiError {
    return new ApiError(
      message,
      400,
      ErrorType.SECURITY_VIOLATION,
      undefined, // No details in response
      cause,
      false // Non-operational - don't show details in production
    );
  }

  /**
   * Creates a database constraint violation error
   * @param message Error message
   * @param constraint The constraint that was violated
   * @param table The affected table
   */
  static constraintViolation(
    message: string,
    constraint: string,
    table?: string
  ): ApiError {
    return new ApiError(message, 409, ErrorType.CONSTRAINT_VIOLATION_ERROR, {
      constraint,
      table,
      type: "database_constraint",
    });
  }

  /**
   * Creates an external service error
   * @param message Error message
   * @param service Name of the external service
   * @param statusCode HTTP status code from the service
   * @param cause Original error
   */
  static externalServiceError(
    message: string,
    service: string,
    statusCode?: number,
    cause?: Error
  ): ApiError {
    const apiStatusCode = statusCode && statusCode >= 500 ? 502 : 400;
    const isOperational = statusCode ? statusCode < 500 : true;

    return new ApiError(
      message,
      apiStatusCode,
      ErrorType.EXTERNAL_SERVICE_ERROR,
      { service, externalStatusCode: statusCode },
      cause,
      isOperational
    );
  }
  // ============= UTILITY METHODS =============

  /**
   * Checks if this is a client error (4xx)
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Checks if this is a server error (5xx)
   */
  public isServerError(): boolean {
    return this.statusCode >= 500;
  }

  public getRetryAfterMiliseconds(): number | undefined {
    return this._details?.getRetryAfterMiliseconds;
  }
}
