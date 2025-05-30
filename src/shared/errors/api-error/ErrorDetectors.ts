import { MongoErrorUtils } from "../MongoValidationError";


export class ErrorDetectors {
  
  static isZodError(err: any): boolean {
    return err.name === 'ZodError' && Array.isArray(err.errors);
  }

  static isMongoError(err: any): boolean {
    return MongoErrorUtils.isValidationError(err) ||
           MongoErrorUtils.isDuplicateKeyError(err) ||
           MongoErrorUtils.isCastError(err) ||
           MongoErrorUtils.isConnectionError(err)||
           MongoErrorUtils.isTransactionError(err);
  }

  static isJWTError(err: any): boolean {
    return err.name === 'JsonWebTokenError' ||
           err.name === 'TokenExpiredError' ||
           err.name === 'NotBeforeError';
  }

  static isMulterError(err: any): boolean {
    return err.name === 'MulterError' || 
           (err.code && err.code.startsWith('LIMIT_'));
  }

  static isRateLimitError(err: any): boolean {
    return err.name === 'RateLimitError' ||
           err.type === 'error.rate_limit_exceeded' ||
           err.statusCode === 429;
  }

  static isTimeoutError(err: any): boolean {
    return err.name === 'TimeoutError' ||
           err.code === 'ETIMEDOUT' ||
           err.code === 'ECONNRESET' ||
           err.timeout === true;
  }
}