import { Types, Document } from "mongoose";
import { EmailVerificationProps } from "../entities/value-objects/email-verification.value-object";
import { TermsAcceptancePrimitives } from "../entities/value-objects/terms-acceptance.value-objects";
import { PasswordResetPrimitives } from "../entities/value-objects/password-reset.value-object";
import { UserStatusType } from "../entities/value-objects/user-status.value-object";

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  STAFF = "staff", // Customer support role
}



export interface SuspensionDetails {
  suspendedAt: Date;
  suspendedUntil?: Date; // Optional: null = indefinite suspension
  suspendedBy: string; // Admin user ID
  suspensionReason: string; // "Fraudulent activity", "Spam", etc.
  internalNotes?: string; // Private admin notes
}
export interface DeactivationDetails {
  deactivatedAt: Date;
  deactivationReason?: string; // Optional: "Taking a break", "Privacy concerns"
}
export interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  //Location
  country: string; // always Romania
  judet: string;
  localitate: string;
  //should be full address (E.g. Timișoara, Calea Bogdanestilor Nr 2 Bloc H Scara A Ap 22)
  address: string;
  //Optional fields mosty for urban countries
  postalCode?: string;
  bloc?: string;
  scara?: string;
  etaj?: string;
  apartament?: string;
}
export interface IUserBase {
  //Basic Info
  email: string;
  passwordHash: string;

  //Profile
  firstName: string;
  lastName: string;
  phone?: string; //Needed for account recovery
  dateOfBirth?: Date; //Needed for birth copuons

  //Role & Status
  role: UserRole;
  terms:TermsAcceptancePrimitives;
  status: UserStatusType;

  // E-commerce
  wishlist?: Types.ObjectId[];

  // Marketing
  newsletter?: boolean;
  marketingConsent?: boolean;

  // Addresses
  addresses: Address[];
  //Email Verification
  
  // Password Reset
  passwordReset?:PasswordResetPrimitives

  // Security - Brute Force Protection
  failedLoginAttempts?: number;
  lockUntil?: Date;

  emailVerification: EmailVerificationProps;
  phoneVerified?: boolean; // Maybe will implement someday
  twoFactorEnabled?: boolean; // Maybe will implement someday

  deactivationDetails?: DeactivationDetails; // Only present if status === "inactive"
  suspensionDetails?: SuspensionDetails; // Only present if status === "suspended"
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface IUser extends IUserBase {
  _id: Types.ObjectId;
}
export interface IUserDocument extends Document, IUserBase {}
