import { ApiError } from "./api-error/ApiError";
import { ValidationError } from "./ValidationError";

export class MongoErrorUtils {
  
  // ============= ERROR TYPE CHECKERS =============
  
  static isValidationError(error: any): boolean {
    return error && error.name === 'ValidationError' && error.errors;
  }

  static isDuplicateKeyError(error: any): boolean {
    return error && error.code === 11000;
  }

  static isCastError(error: any): boolean {
    return error && error.name === 'CastError';
  }

  static isConnectionError(error: any): boolean {
    return error && (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.name === 'MongoServerSelectionError'
    );
  }

  static isTransactionError(error: any): boolean {
    return error && (
      error.name === 'MongoTransactionError' ||
      error.errorLabels?.includes('TransientTransactionError')
    );
  }

  // ============= FIELD EXTRACTION UTILITIES =============

  static extractDuplicateField(error: any): string {
    if (!this.isDuplicateKeyError(error)) return 'unknown';
    
    const message = error.message || '';
    const match = message.match(/dup key: \{ ([^:]+):/);
    return match ? match[1].trim() : 'unknown';
  }

  static extractDuplicateValue(error: any): any {
    if (!this.isDuplicateKeyError(error)) return undefined;
    
    const message = error.message || '';
    const match = message.match(/dup key: \{ [^:]+: "?([^"]+)"? \}/);
    return match ? match[1] : undefined;
  }

  // ============= VALIDATION ERROR CREATORS =============

  static createValidationErrorFromMongoose(error: any): ValidationError {
    if (!this.isValidationError(error)) {
      throw new Error('Not a Mongoose validation error');
    }

    const validationFields = Object.keys(error.errors).map(field => {
      const fieldError = error.errors[field];
      return {
        field,
        message: fieldError.message,
        rule: this.mapMongooseKind(fieldError.kind),
        value: fieldError.value
      };
    });

    return new ValidationError(
      'Database validation failed',
      validationFields,
      'domain',
      error
    );
  }

  static createDuplicateKeyError(error: any, customMessages?: Record<string, string>): ValidationError {
    if (!this.isDuplicateKeyError(error)) {
      throw new Error('Not a duplicate key error');
    }

    const field = this.extractDuplicateField(error);
    const value = this.extractDuplicateValue(error);
    
    // Use custom message if provided
    const message = customMessages?.[field] || `${field} already exists`;

    return new ValidationError(
      'Duplicate value found',
      [{
        field,
        message,
        rule: 'unique',
        value
      }],
      'domain',
      error
    );
  }

  static createCastError(error: any): ValidationError {
    if (!this.isCastError(error)) {
      throw new Error('Not a cast error');
    }

    return new ValidationError(
      `Invalid ${error.path} format`,
      [{
        field: error.path,
        message: `Invalid ${error.path} format`,
        rule: 'format',
        value: error.value
      }],
      'domain',
      error
    );
  }

  // ============= SYSTEM ERROR CREATORS =============

  static createConnectionError(operation?: string, error?: Error): ApiError {
    return ApiError.internalError(
      `Database connection failed${operation ? ` during ${operation}` : ''}`,
      error
    );
  }

  static createTransactionError(operation: string, error?: Error): ApiError {
    return ApiError.internalError(
      `Database transaction failed: ${operation}`,
      error
    );
  }

  // ============= UTILITY METHODS =============

  private static mapMongooseKind(kind: string): string {
    const kindMap: Record<string, string> = {
      'required': 'required',
      'min': 'minimum',
      'max': 'maximum',
      'minlength': 'minLength',
      'maxlength': 'maxLength',
      'enum': 'enum',
      'regexp': 'pattern'
    };
    return kindMap[kind] || 'validation';
  }
}
