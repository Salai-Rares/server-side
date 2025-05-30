import { HttpStatus, ErrorType, ERROR_MESSAGES } from "@/constants";
import { ZodError, ZodIssue } from "zod";
import { SerializedError } from "../types/serialized-error.types";
import { ApiError } from "./api-error/ApiError";
export interface ValidationField {
  field: string;
  message: string;
  rule?: string;
  value?: any;
}
export class ValidationError extends ApiError {
  private readonly _validationFields: ValidationField[];
  private readonly _validationSource: 'zod' | 'domain';

  constructor(
    message: string,
    validationFields: ValidationField[],
    source: 'zod' | 'domain' = 'zod',
    cause?: Error
  ) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorType.VALIDATION_ERROR,
      { validationFields, failedFieldCount: validationFields.length },
      cause,
      true // Validation errors are operational
    );
    
    this._validationFields = validationFields;
    this._validationSource = source;
  }
   public isRetryable(): boolean {
    return false; // Validation errors are client errors - never retry
  }

  public getRetryAfterSeconds(): number {
    return 0; // Not retryable, so no delay needed
  }

  // ============= SERIALIZATION =============

 public serialize(): SerializedError {
    const base = super.serialize();
    const shouldHideDetails = this.isProductionMode();
    
    return {
      ...base,
      details: {
        ...base.details,
        validationFields: shouldHideDetails 
          ? this._validationFields.map(f => ({ field: f.field, message: f.message, rule: f.rule }))
          : this._validationFields,
        validationSource: this._validationSource,
        failedFieldCount: this._validationFields.length
      }
    };
  }

  // ============= ZOD INTEGRATION =============

  static fromZodError(zodError: ZodError, customMessage?: string): ValidationError {
    const message = customMessage || ERROR_MESSAGES.VALIDATION.GENERIC;
    
    const validationFields: ValidationField[] = zodError.errors.map((issue: ZodIssue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
      rule: this.mapZodCode(issue.code),
      value: 'received' in issue ? issue.received : undefined
    }));

    return new ValidationError(message, validationFields, 'zod',zodError);
  }

  private static mapZodCode(code: string): string {
    const map: Record<string, string> = {
      'invalid_string': 'format',
      'too_small': 'minLength',
      'too_big': 'maxLength',
      'invalid_enum_value': 'enum'
    };
    return map[code] || code;
  }

  // ============= DOMAIN VALIDATION =============

  static domainRule(field: string, rule: string, message: string, value?: any): ValidationError {
    return new ValidationError(message, [{ field, message, rule, value }], 'domain');
  }

  static domainRules(message: string, fields: ValidationField[]): ValidationError {
    return new ValidationError(message, fields, 'domain');
  }

  // ============= UTILITY METHODS (ONLY ESSENTIAL ONES) =============

  public hasField(fieldName: string): boolean {
    return this._validationFields.some(f => f.field === fieldName);
  }

  public getFieldError(fieldName: string): string | null {
    const field = this._validationFields.find(f => f.field === fieldName);
    return field ? field.message : null;
  }

  public getFailedFields(): string[] {
    return this._validationFields.map(f => f.field);
  }

}