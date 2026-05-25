import mongoose, { Model, Schema, Types } from "mongoose";
import {
  Address,
  IUserDocument,
  UserRole,

} from "../../domain/types/user.types";
import { EmailVerificationProps } from "../../domain/entities/value-objects/email-verification.value-object";
import { UserStatus } from "../../domain/entities/value-objects/user-status.value-object";

const AddressSchema = new Schema<Address>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^(\+4|0)[0-9]{9}$/,
        "Please provide a valid Romanian phone number",
      ],
    },
    country: {
      type: String,
      required: true,
      default: "Romania",
      immutable: true, // Can't be changed after creation
    },
    judet: {
      type: String,
      required: [true, "Județ is required"],
      trim: true,
    },
    localitate: {
      type: String,
      required: [true, "Localitate is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    postalCode: {
      type: String,
      trim: true,
      match: [/^[0-9]{6}$/, "Postal code must be 6 digits"],
    },
    bloc: {
      type: String,
      trim: true,
      maxlength: [10, "Bloc cannot exceed 10 characters"],
    },
    scara: {
      type: String,
      trim: true,
      maxlength: [10, "Scara cannot exceed 10 characters"],
    },
    etaj: {
      type: String,
      trim: true,
      maxlength: [10, "Etaj cannot exceed 10 characters"],
    },
    apartament: {
      type: String,
      trim: true,
      maxlength: [10, "Apartament cannot exceed 10 characters"],
    },
  },
  { _id: false }
); // Don't create _id for subdocuments);

const EmailVerificationSchema = new Schema<EmailVerificationProps>(
  {
    status: {
      type: String,
      enum: ["pending", "verified", "expired"],
      default: "pending",
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
  },
  { _id: false }
);
const UserSchema = new Schema<IUserDocument>(
  {
    // Basic Info
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
      index: true, // Index for faster queries
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't include in queries by default (security)
    },
    // Profile
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^(\+4|0)[0-9]{9}$/,
        "Please provide a valid Romanian phone number",
      ],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (date: Date) {
          // Must be at least 13 years old (GDPR requirement for minors)
          const thirteenYearsAgo = new Date();
          thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
          return date <= thirteenYearsAgo;
        },
        message: "You must be at least 13 years old",
      },
    },
    // Role & Status
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "{VALUE} is not a valid role",
      },
      default: UserRole.CUSTOMER,
    },
    terms: {
      accepted: { type: Boolean, default: false },
      version: { type: String },
      acceptedAt: { type: Date },
    },
    status: {
      type: String,
      enum: {
        values: Object.values(UserStatus),
        message: "{VALUE} is not a valid status",
      },
      default: UserStatus.ACTIVE,
      index: true,
    },
    // E-commerce
    wishlist: {
      type: [Schema.Types.ObjectId],
      ref: "Product",
      default: [],
      validate: {
        validator: function (arr: Types.ObjectId[]) {
          // Limit wishlist to 100 items
          return arr.length <= 100;
        },
        message: "Wishlist cannot exceed 100 items",
      },
    },
    // Marketing
    newsletter: {
      type: Boolean,
      default: false,
    },
    marketingConsent: {
      type: Boolean,
      default: false,
    },
    // Addresses
    addresses: {
      type: [AddressSchema],
      default: [],
      validate: {
        validator: function (arr: any[]) {
          // Limit to 10 addresses
          return arr.length <= 10;
        },
        message: "Cannot have more than 10 addresses",
      },
    },

    // Verification
    emailVerification: {
      type: EmailVerificationSchema,
      required: true,
      default: {
        status: "pending",
        verifiedAt: null,
      },
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    // Security - Brute Force Protection
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Timestamps
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "Users",
  }
);

// After the schema definition:

UserSchema.set("toJSON", {
  virtuals: false, // No virtuals in DDD
  transform: function (doc, ret) {
    // Extra safety - remove sensitive fields
    delete ret.passwordHash;
  
    delete ret.__v;
    return ret;
  },
});
// After the schema definition, add:

// Compound indexes for admin queries
UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 }); // For "newest first" queries


const UserModel : Model<IUserDocument> = mongoose.model("User",UserSchema)
export default UserModel