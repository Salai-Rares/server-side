import {
  UserRole,
  Address,
  DeactivationDetails,
  SuspensionDetails,
} from "../types/user.types";
import { UserProps, UserRegisterProps } from "./user.types";
import { EmailVerificationVO } from "./value-objects/email-verification.value-object";

import { EmailVO } from "./value-objects/email.value-object";
import { UserStatusVO } from "./value-objects/user-status.value-object";
import { PasswordResetVO } from "./value-objects/password-reset.value-object";
import { TermsAcceptanceVO } from "./value-objects/terms-acceptance.value-objects";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ValidationError } from "@/shared/errors/ValidationError";
import { AggregateRoot } from "@/core/domain/aggregate-root.abstract";
import {
  createUserRegisteredDomainEvent,
  UserRegisteredDomainEvent,
} from "../events/user-registered/user-registered.domain.interface";

export class UserEntity extends AggregateRoot implements UserProps {
  private readonly _id: string;
  private readonly _email: EmailVO;
  private _passwordHash: string | null;
  private _firstName: string;
  private _lastName: string;
  private _role: UserRole;
  private _terms: TermsAcceptanceVO;
  private _status: UserStatusVO;
  private _addresses: Address[];
  private _wishlist: string[];
  private _emailVerification: EmailVerificationVO;
  private _newsletter?: boolean | undefined;
  private _marketingConsent?: boolean | undefined;
  private _phoneVerified?: boolean | undefined;
  private _twoFactorEnabled?: boolean | undefined;
  private _phone?: string | undefined;
  private _dateOfBirth?: Date | undefined;

  private _failedLoginAttempts?: number | undefined;
  private _lockUntil?: Date | undefined;
  private _deactivationDetails?: DeactivationDetails | undefined;
  private _suspensionDetails?: SuspensionDetails | undefined;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _lastLoginAt?: Date | undefined;

  private constructor(props: UserProps) {
    super();
    // Required fields
    this._id = props.id;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._role = props.role;
    this._status = props.status;
    this._addresses = props.addresses;
    this._emailVerification = props.emailVerification;
    this._terms = props.terms;
    // Optional fields
    this._wishlist = props.wishlist;
    this._newsletter = props.newsletter;
    this._marketingConsent = props.marketingConsent;
    this._phoneVerified = props.phoneVerified;
    this._twoFactorEnabled = props.twoFactorEnabled;
    this._phone = props.phone;
    this._dateOfBirth = props.dateOfBirth;

    this._failedLoginAttempts = props.failedLoginAttempts;
    this._lockUntil = props.lockUntil;
    this._deactivationDetails = props.deactivationDetails;
    this._suspensionDetails = props.suspensionDetails;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._lastLoginAt = props.lastLoginAt;
  }

  // =====================
  // Getters - Identity
  // =====================
  get id(): string {
    return this._id;
  }
  get email(): EmailVO {
    return this._email;
  }

  get emailVerification(): EmailVerificationVO {
    return this._emailVerification;
  }
  // =====================
  // Getters - Core Fields
  // =====================
  get passwordHash(): string | null {
    return this._passwordHash;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get role(): UserRole {
    return this._role;
  }
  get terms(): TermsAcceptanceVO {
    return this._terms;
  }
  get status(): UserStatusVO {
    return this._status;
  }
  // =====================
  // Getters - Collections
  // =====================
  get addresses(): Address[] {
    return [...this._addresses]; // Return copy to prevent external mutation
  }
  get wishlist(): string[] {
    return [...this._wishlist]; // Return copy
  }
  // =====================
  // Getters - Flags
  // =====================

  get newsletter(): boolean | undefined {
    return this._newsletter;
  }
  get marketingConsent(): boolean | undefined {
    return this._marketingConsent;
  }
  get phoneVerified(): boolean | undefined {
    return this._phoneVerified;
  }
  get twoFactorEnabled(): boolean | undefined {
    return this._twoFactorEnabled;
  }
  // =====================
  // Getters - Optional Fields
  // =====================
  get phone(): string | undefined {
    return this._phone;
  }
  get dateOfBirth(): Date | undefined {
    return this._dateOfBirth;
  }
  // =====================
  // Getters - Reset Password
  // =====================

  // =====================
  // Getters - Security (Brute Force Protection)
  // =====================
  get failedLoginAttempts(): number | undefined {
    return this._failedLoginAttempts;
  }
  get lockUntil(): Date | undefined {
    return this._lockUntil;
  }
  // =====================
  // Getters - Moderation
  // =====================
  get deactivationDetails(): DeactivationDetails | undefined {
    return this._deactivationDetails;
  }
  get suspensionDetails(): SuspensionDetails | undefined {
    return this._suspensionDetails;
  }
  // =====================
  // Getters - Timestamps
  // =====================
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }
  // =====================
  // Computed Getters
  // =====================
  /**
   * Get full name
   */
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
  /**
   * Get email as string
   */
  get emailAddress(): string {
    return this._email.value;
  }

  private validate(): void {
    // 1) timestamps
    if (!this._createdAt || !this._updatedAt) {
      throw ValidationError.domainRule(
        "timestamps",
        "missing",
        "User must always have createdAt and updatedAt"
      );
    }

    // 2) failed login attempts
    if (
      this._failedLoginAttempts !== undefined &&
      this._failedLoginAttempts < 0
    ) {
      throw ValidationError.domainRule(
        "failedLoginAttempts",
        "negative_value",
        "Failed login attempts cannot be negative",
        this._failedLoginAttempts
      );
    }

    // 3) phone / phoneVerified invariant
    if (!this._phone && this._phoneVerified === true) {
      throw ValidationError.domainRule(
        "phoneVerified",
        "verified_without_phone",
        "Cannot have phoneVerified = true when no phone is set"
      );
    }

    // 4) status-specific details
    if (this._status.isInactive() && !this._deactivationDetails) {
      throw ValidationError.domainRule(
        "deactivationDetails",
        "missing_when_inactive",
        "Inactive user must have deactivationDetails"
      );
    }
    if (this._status.isSuspended() && !this._suspensionDetails) {
      throw ValidationError.domainRule(
        "suspensionDetails",
        "missing_when_suspended",
        "Suspended user must have suspensionDetails"
      );
    }
    // 5) terms vs active status, if your VO supports it
    if (this._status.isActive() && !this._terms.accepted) {
      throw ValidationError.domainRule(
        "terms",
        "active_without_terms",
        "Active user must have accepted the terms and conditions"
      );
    }
  }

  static fromPersistence(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  markEmailVerified(): void {
    this._emailVerification = this._emailVerification.markVerified();
    this._updatedAt = new Date();
  }

  static register(props: UserRegisterProps): UserEntity {
    const emailVerification = EmailVerificationVO.pending();
    const now = new Date();
    // Optional: forbid explicit "false" on registration
    if (props.newsletter === false || props.marketingConsent === false) {
      throw ValidationError.domainRule(
        "consent",
        "explicit_opt_out_on_register",
        "On registration, leave newsletter/marketing unchecked instead of explicitly opting out",
        {
          newsletter: props.newsletter,
          marketingConsent: props.marketingConsent,
        }
      );
    }
    const fullProps: UserProps = {
      id: props.id,
      email: EmailVO.create(props.email),
      passwordHash: props.passwordHash,
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),

      role: props.role ?? UserRole.CUSTOMER,
      status: UserStatusVO.active(),
      terms: TermsAcceptanceVO.accept(props.termsVersion),
      emailVerification,

      addresses: [],
      wishlist: [],

      newsletter: props.newsletter, // can be true or undefined
      marketingConsent: props.marketingConsent, // can be true or undefined

      twoFactorEnabled: false,

      failedLoginAttempts: 0,
      lockUntil: undefined,
      deactivationDetails: undefined,
      suspensionDetails: undefined,
      phoneVerified: undefined,
   
      createdAt: now,
      updatedAt: now,
      lastLoginAt: undefined,
    };

    const user = new UserEntity(fullProps);
    user.addDomainEvent(
      createUserRegisteredDomainEvent({
        userId: user.id,
        email: user.email.value,
        firstName:user.firstName,
        lastName:user.lastName
      })
    );
    return user;
  }




}
