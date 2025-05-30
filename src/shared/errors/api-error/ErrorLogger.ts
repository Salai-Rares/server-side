import { injectable } from "inversify";
import { BaseError } from "../BaseError";
import { Request } from "express";
@injectable()
export class ErrorLogger {
  constructor(
    // @inject(TYPES.Logger) private logger: ILogger
  ) {}

  /**
   * Logs error with appropriate level and context
   */
  logError(error: BaseError, req: Request): void {
    const logData = {
      ...error.getLogData(),
      httpContext: this.buildHttpContext(req)
    };

    // Log level based on status code and operational status
    if (error.statusCode >= 500 && !error.isOperational) {
    //   this.logger.error('HTTP Critical Error', logData);
    } else if (error.statusCode >= 500) {
    //   this.logger.error('HTTP Server Error', logData);
    } else if (error.statusCode >= 400) {
    //   this.logger.warn('HTTP Client Error', logData);
    } else {
    //   this.logger.info('HTTP Error', logData);
    }
  }

  private buildHttpContext(req: Request): Record<string, any> {
    return {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      userAgent: req.headers['user-agent'],
      ip: this.extractClientIp(req),
      requestSize: req.headers['content-length'],
      route: req.route?.path,
      params: req.params,
      query: this.sanitizeQuery(req.query),
    };
  }

  private extractClientIp(req: Request): string | undefined {
    return (
      req.ip ||
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.socket?.remoteAddress
    );
  }

  private sanitizeQuery(query: any): any {
    if (!query || typeof query !== 'object') return query;

    const sanitized = { ...query };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}