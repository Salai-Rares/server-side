import { ValidationError } from "@/shared/errors/ValidationError";

export type EmailVerificationStatus = "pending" | "verified";

export interface EmailVerificationProps {
  status: EmailVerificationStatus;
  verifiedAt?: Date | null;
}

/**
 * Value Object that encapsulates the email verification lifecycle:
 * - pending (has token + expiry)
 * - verified (no need for token/expiry anymore)
 * - expired (token no longer usable, can request new one)
 */
export class EmailVerificationVO {
  private constructor(
    private readonly _status: EmailVerificationStatus,
    private readonly _verifiedAt?: Date | null
  ) {
    this.validate();
  }



  // ===========
  // Factories
  // ===========

   static pending(): EmailVerificationVO {
    return new EmailVerificationVO("pending", null);
  }

  static verified(verifiedAt: Date = new Date()): EmailVerificationVO {
    return new EmailVerificationVO("verified", verifiedAt);
  }

  /**
   * Rebuild from persistence (DB row → VO)
   */
  static fromPersistence(props: EmailVerificationProps): EmailVerificationVO {
    return new EmailVerificationVO(props.status, props.verifiedAt ?? null);
  }

  // ===========
  // Validation
  // ===========

  // Validation
  private validate(): void {
    if (this._status === "pending" && this._verifiedAt) {
      throw ValidationError.domainRule(
        "emailVerification",
        "pending_no_verifiedAt",
        "Pending email should not have verifiedAt"
      );
    }
  }

  // ===========
  // Getters
  // ===========

  get status(): EmailVerificationStatus {
    return this._status;
  }

  get verifiedAt(): Date | null | undefined {
    return this._verifiedAt;
  }

  // ===========
  // State checks
  // ===========

  isPending(): boolean {
    return this._status === "pending";
  }

  isVerified(): boolean {
    return this._status === "verified";
  }

  // ===========
  // Transitions
  // ===========

  markVerified(now: Date = new Date()): EmailVerificationVO {
    if (this._status === "verified") return this;

    return EmailVerificationVO.verified(now);
  }

  // ===========
  // Utilities
  // ===========

  equals(other: EmailVerificationVO): boolean {
    return (
      this._status === other._status &&
      (this._verifiedAt?.getTime() ?? 0) === (other._verifiedAt?.getTime() ?? 0)
    );
  }
     toPrimitives(): EmailVerificationProps {
    return {status:this._status,verifiedAt:this._verifiedAt}
  }
}
