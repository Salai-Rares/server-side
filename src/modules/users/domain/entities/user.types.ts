import {
  Address,
  DeactivationDetails,
  SuspensionDetails,
  UserRole,
} from "../types/user.types";
import { EmailVerificationVO } from "./value-objects/email-verification.value-object";
import { EmailVO } from "./value-objects/email.value-object";
import { PasswordResetVO } from "./value-objects/password-reset.value-object";
import { TermsAcceptanceVO } from "./value-objects/terms-acceptance.value-objects";
import { UserStatusVO } from "./value-objects/user-status.value-object";

/**
 * Props interface for creating a User entity.
 * Framework-agnostic - uses plain JavaScript types only.
 */
export interface UserProps {
  // Identity
  id: string; // ✅ Plain string, not Types.ObjectId

  // Core fields
  email: EmailVO;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  emailVerification: EmailVerificationVO;
  role: UserRole;
  terms:TermsAcceptanceVO;
  status: UserStatusVO;

  // Collections
  addresses: Address[];
  wishlist: string[];

  // Flags

  newsletter?: boolean;
  marketingConsent?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;

  // Optional fields
  phone?: string;
  dateOfBirth?: Date;
 
  // Security - Brute Force Protection
  failedLoginAttempts?: number;
  lockUntil?: Date;
  deactivationDetails?: DeactivationDetails; // Only present if status === "inactive"
  suspensionDetails?: SuspensionDetails; // Only present if status === "suspended"
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}


/**
 * Minimal props required to create a NEW user in the domain.
 * Used ONLY by User.register().
 */
export interface UserRegisterProps {
  id:string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  termsVersion:string;
  // Optional domain choices
  role?: UserRole; // defaults to "customer" or whatever you want

  // Optional marketing flags
  newsletter?: boolean;
  marketingConsent?: boolean;
}