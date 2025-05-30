import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ErrorLogger } from "@/shared/errors/api-error/ErrorLogger";
import { ErrorConverter } from "@/shared/errors/api-error/ErrorConverter";
import { RequestContextBuilder } from "@/shared/errors/api-error/RequestContextBuilder";
import { BaseError } from "@/shared/errors/BaseError";
import { ApiErrorContext } from "@/shared/errors/error-context/api-error-context";
import { TYPES } from "@/shared/types";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class GlobalErrorHandler {
  constructor(
    @inject(TYPES.ErrorConverter) private errorConverter: ErrorConverter,
    @inject(TYPES.RequestContextBuilder)
    private contextBuilder: RequestContextBuilder,
    @inject(TYPES.ErrorLogger) private errorLogger: ErrorLogger,
    /*@inject(TYPES.Logger) private logger: ILogger*/
  ) {}

  public handle = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => { try {
      // 1. Normalize the error
      const error = this.normalizeError(err, req);
      
      // 2. Log the error
      this.errorLogger.logError(error, req);
      
      // 3. Send response
      this.sendErrorResponse(error, res);
      
    } catch (handlerError) {
      this.handleCriticalFailure(handlerError, res);
    }};

   /**
   * Converts any error to a BaseError - much simpler now
   */
  private normalizeError(err: unknown, req: Request): BaseError {
    const context = this.contextBuilder.buildFromRequest(req);
    
    // Already a BaseError - just ensure API context
    if (err instanceof BaseError) {
      this.ensureApiContext(err, context);
      return err;
    }

    // Raw Error - convert using ErrorConverter
    if (err instanceof Error) {
      return this.errorConverter.convertToBaseError(err, context);
    }

    // Non-Error object - handle as string
    const message = typeof err === 'string' ? err : 'Unknown error occurred';
    const apiError = ApiError.internalError(message);
    apiError.setContext(context);
    return apiError;
  }

  /**
   * Ensures BaseError has API context
   */
  private ensureApiContext(error: BaseError, context: ApiErrorContext): void {
    if (!error.hasContext() || !(error.context instanceof ApiErrorContext)) {
      error.setContext(context);
    }
  }

   /**
   * Sends error response to client
   */
  private sendErrorResponse(error: BaseError, res: Response): void {
    if (res.headersSent) return;

    this.setSecurityHeaders(res);
    const serializedError = error.serialize();
    res.status(error.statusCode).json(serializedError);
  }

  /**
   * Handles critical failure in error handler
   */
  private handleCriticalFailure(handlerError: unknown, res: Response): void {
  /*  this.logger.error('Critical error in global error handler', {
      handlerError: handlerError instanceof Error ? {
        name: handlerError.name,
        message: handlerError.message,
        stack: handlerError.stack
      } : handlerError,
      timestamp: new Date().toISOString()
    });
    */
    if (!res.headersSent) {
      this.setSecurityHeaders(res);
      res.status(500).json({
        success: false,
        error: 'CRITICAL_FAILURE',
        message: 'An unrecoverable error occurred',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Sets security headers on responses
   */
  private setSecurityHeaders(res: Response): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

}
