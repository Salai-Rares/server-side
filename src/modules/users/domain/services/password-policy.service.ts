import { ValidationError } from "@/shared/errors/ValidationError";
import { injectable } from "inversify";

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  allowWhitespace: boolean;
}

const DEFAULT_POLICY: PasswordPolicyConfig = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
  allowWhitespace: false,
};

@injectable()
export class PasswordPolicy {
  private readonly config: PasswordPolicyConfig;

  constructor() {
    this.config = { ...DEFAULT_POLICY};
  }

  /**
   * Validate password according to policy.
   * Throws ValidationError.domainRule if invalid.
   */
  public validate(password: string): void {
    const errors = [];

    if (!password || typeof password !== "string") {
      throw ValidationError.domainRule(
        "password",
        "invalid_type",
        "Password must be a non-empty string"
      );
    }

    if (password.length < this.config.minLength) {
      errors.push({
        field: "password",
        rule: "min_length",
        message: `Password must be at least ${this.config.minLength} characters`,
      });
    }

    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push({
        field: "password",
        rule: "uppercase_required",
        message: "Password must contain at least one uppercase letter",
      });
    }

    if (this.config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push({
        field: "password",
        rule: "lowercase_required",
        message: "Password must contain at least one lowercase letter",
      });
    }

    if (this.config.requireDigit && !/[0-9]/.test(password)) {
      errors.push({
        field: "password",
        rule: "digit_required",
        message: "Password must contain at least one number",
      });
    }

    if (this.config.requireSpecial && !/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`~]/.test(password)) {
      errors.push({
        field: "password",
        rule: "special_required",
        message: "Password must contain at least one special character",
      });
    }

    if (!this.config.allowWhitespace && /\s/.test(password)) {
      errors.push({
        field: "password",
        rule: "no_whitespace",
        message: "Password cannot contain whitespace",
      });
    }

    if (errors.length > 0) {
      throw ValidationError.domainRules(
        "Password does not meet the required security rules",
        errors
      );
    }
  }
}
