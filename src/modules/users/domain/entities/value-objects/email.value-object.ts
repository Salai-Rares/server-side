import { ERROR_MESSAGES } from "@/constants/errors.constants";
import { ValidationError } from "@/shared/errors/ValidationError";

export class EmailVO {
  private readonly _value: string;
  private constructor(email: string) {
    this._value = email;
  }

  static create(email: string): EmailVO {
    const trimmed = email.trim().toLowerCase();
    if (!this.isValidEmail(trimmed)) {
      throw ValidationError.domainRule(
        "email",
        "invalid_format",
        ERROR_MESSAGES.EMAIL.INVALID
      );
    }
    return new EmailVO(trimmed);
  }
  get value(): string {
    return this._value;
  }

  equals(other: EmailVO): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
