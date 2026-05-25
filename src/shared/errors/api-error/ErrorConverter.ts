// shared/errors/api-error/error-converter.ts
import { injectable } from "inversify";
import { BaseError } from "../BaseError";
import { ApiErrorContext } from "../error-context/api-error-context";
import { ValidationError } from "../ValidationError";
import { ErrorDetectors } from "./ErrorDetectors";
import { MongoErrorUtils } from "../MongoValidationError";
import { ApiError } from "./ApiError";
import { ERROR_MESSAGES, DERIVED_FIELD_MAPPINGS } from '@/constants/errors.constants';
@injectable()
export class ErrorConverter {
  


  /**
   * Converts raw errors to appropriate BaseError types
   */
  convertToBaseError(err: Error, context: ApiErrorContext): BaseError {
    if (ErrorDetectors.isZodError(err)) {
      return this.handleZodError(err, context);
    }

    if (ErrorDetectors.isMongoError(err)) {
      return this.handleMongoError(err, context);
    }

    if (ErrorDetectors.isJWTError(err)) {
      return this.handleJWTError(err, context);
    }

    if (ErrorDetectors.isMulterError(err)) {
      return this.handleMulterError(err, context);
    }

    if (ErrorDetectors.isRateLimitError(err)) {
      return this.handleRateLimitError(err, context);
    }

    if (ErrorDetectors.isTimeoutError(err)) {
      return this.handleTimeoutError(err, context);
    }

    // Generic Error fallback
    return this.handleGenericError(err, context);
  }

  private handleZodError(err: any, context: ApiErrorContext): ValidationError {
    const validationError = ValidationError.fromZodError(err);
    validationError.setContext(context);
    return validationError;
  }

  private handleMongoError(err: any, context: ApiErrorContext): BaseError {
  let error: BaseError;

  if (MongoErrorUtils.isValidationError(err)) {
    error = MongoErrorUtils.createValidationErrorFromMongoose(err);
  } else if (MongoErrorUtils.isDuplicateKeyError(err)) {
    const dbField = MongoErrorUtils.extractDuplicateField(err);
    const value = MongoErrorUtils.extractDuplicateValue(err);
    
    // Map derived fields to user-facing fields
    const userFacingField = DERIVED_FIELD_MAPPINGS[dbField] || dbField;
    
    // Check the user-facing field
    const message = ERROR_MESSAGES.DUPLICATE[userFacingField  as keyof typeof ERROR_MESSAGES.DUPLICATE] || 
                    `${userFacingField} already exists`;
    
    error = MongoErrorUtils.createDuplicateKeyError(
      err,
      userFacingField,
      message,
      value
    );
  } else if (MongoErrorUtils.isCastError(err)) {
    error = MongoErrorUtils.createCastError(err);
  } else if (MongoErrorUtils.isConnectionError(err)) {
    error = ApiError.serviceUnavailable('Database temporarily unavailable', 30, err);
  } else {
    error = ApiError.databaseError('database_operation', err);
  }

  error.setContext(context);
  return error;
}

  private handleJWTError(err: any, context: ApiErrorContext): ApiError {
    const authError = ApiError.unauthorized('Invalid or expired token', { tokenError: err.name });
    authError.setContext(context);
    return authError;
  }

  private handleMulterError(err: any, context: ApiErrorContext): ApiError {
    let error: ApiError;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        error = ApiError.badRequest('File too large', {
          maxSize: err.limit,
          field: err.field
        });
        break;
      case 'LIMIT_FILE_COUNT':
        error = ApiError.badRequest('Too many files', {
          maxCount: err.limit,
          field: err.field
        });
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = ApiError.badRequest('Unexpected file field', {
          field: err.field
        });
        break;
      default:
        error = ApiError.badRequest('File upload error', {
          code: err.code
        });
    }

    error.setContext(context);
    return error;
  }

  private handleRateLimitError(err: any, context: ApiErrorContext): ApiError {
    const rateLimitError = ApiError.tooManyRequests('Rate limit exceeded');
    rateLimitError.setContext(context);
    return rateLimitError;
  }

  private handleTimeoutError(err: any, context: ApiErrorContext): ApiError {
    const timeoutMs = this.extractTimeout(err);
    const timeoutError = ApiError.gatewayTimeout('Request timeout', undefined, timeoutMs);
    timeoutError.setContext(context);
    return timeoutError;
  }

  private handleGenericError(err: Error, context: ApiErrorContext): ApiError {
    const apiError = ApiError.internalError(err.message, err);
    apiError.setContext(context);
    return apiError;
  }

  private extractTimeout(err: any): number | undefined {
    const match = err.message?.match(/(\d+)ms/);
    return match ? parseInt(match[1]) : undefined;
  }
}