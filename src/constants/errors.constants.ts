export const ERROR_MESSAGES = {
  // Authentication & Authorization
  AUTH: {
    REQUIRED: "Authentication required",
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Authentication token has expired",
    TOKEN_INVALID: "Invalid authentication token",
    ACCESS_DENIED: "Access denied",
    INSUFFICIENT_PERMISSIONS: "Insufficient permissions for this action",
    ACCOUNT_LOCKED: "Account has been locked due to too many failed attempts",
    ACCOUNT_DISABLED: "Account has been disabled",
    SESSION_EXPIRED: "Session has expired, please login again",
  },
  
  // Validation Messages
  VALIDATION: {
    GENERIC: "Validation failed",
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_FORMAT: (field: string) => `${field} has invalid format`,
    TOO_SHORT: (field: string, min: number) => `${field} must be at least ${min} characters long`,
    TOO_LONG: (field: string, max: number) => `${field} must not exceed ${max} characters`,
    INVALID_RANGE: (field: string, min: number, max: number) => `${field} must be between ${min} and ${max}`,
    INVALID_ENUM: (field: string, values: string[]) => `${field} must be one of: ${values.join(', ')}`,
  },

  // Field-specific validation
  USERNAME: {
    MIN_LENGTH: "Username must be at least 5 characters long",
    MAX_LENGTH: "Username must not exceed 30 characters",
    NO_SPECIAL_CHARS: "Username must not contain special characters",
    ALREADY_EXISTS: "Username is already taken",
    INVALID_FORMAT: "Username can only contain letters, numbers, and underscores",
  },
  
  PASSWORD: {
    MIN_LENGTH: "Password must be at least 8 characters long",
    MAX_LENGTH: "Password must not exceed 128 characters",
    UPPERCASE: "Password must contain at least one uppercase letter",
    LOWERCASE: "Password must contain at least one lowercase letter",
    NUMBER: "Password must contain at least one number",
    SPECIAL_CHAR: "Password must contain at least one special character",
    NO_COMMON: "Password is too common, please choose a stronger password",
    CURRENT_MISMATCH: "Current password is incorrect",
    SAME_AS_CURRENT: "New password must be different from current password",
  },
  
  EMAIL: {
    INVALID: "Introduceți o adresă de email validă",
    ALREADY_EXISTS: "Email address is already registered",
    NOT_FOUND: "No account found with this email address",
    VERIFICATION_REQUIRED: "Please verify your email address",
    VERIFICATION_EXPIRED: "Email verification link has expired",
  },

  // Resource Messages
  RESOURCE: {
    NOT_FOUND: (resource: string) => `${resource} not found`,
    ALREADY_EXISTS: (resource: string) => `${resource} already exists`,
    CREATION_FAILED: (resource: string) => `Failed to create ${resource}`,
    UPDATE_FAILED: (resource: string) => `Failed to update ${resource}`,
    DELETION_FAILED: (resource: string) => `Failed to delete ${resource}`,
    ACCESS_DENIED: (resource: string) => `Access denied to ${resource}`,
  },

  // User-specific messages
  USER: {
    NOT_FOUND: "User not found",
    ALREADY_EXISTS: "User already exists",
    PROFILE_INCOMPLETE: "User profile is incomplete",
    ACCOUNT_SUSPENDED: "User account has been suspended",
    EMAIL_NOT_VERIFIED: "Please verify your email before proceeding",
  },

  // Business Logic Messages
  BUSINESS: {
    OUT_OF_STOCK: "Product is currently out of stock",
    INSUFFICIENT_FUNDS: "Insufficient funds for this transaction",
    PRICE_MISMATCH: "Product price has changed, please refresh and try again",
    QUOTA_EXCEEDED: "Usage quota has been exceeded",
    FEATURE_DISABLED: "This feature is currently disabled",
    MAINTENANCE_MODE: "Service is under maintenance, please try again later",
    UNSUPPORTED_OPERATION: "This operation is not supported",
  },

  // System Messages
  SYSTEM: {
    INTERNAL_ERROR: "Something went wrong",
    SERVICE_UNAVAILABLE: "Service is temporarily unavailable",
    RATE_LIMITED: "Too many requests, please try again later",
    TIMEOUT: "Request timed out, please try again",
    DATABASE_ERROR: "Database operation failed",
    EXTERNAL_SERVICE_ERROR: "External service error occurred",
    NETWORK_ERROR: "Network connection error",
    FILE_UPLOAD_ERROR: "File upload failed",
    FILE_TOO_LARGE: "File size exceeds maximum allowed limit",
    UNSUPPORTED_FILE_TYPE: "File type is not supported",
  },

  // Payment Messages
  PAYMENT: {
    FAILED: "Payment processing failed",
    DECLINED: "Payment was declined",
    INSUFFICIENT_FUNDS: "Insufficient funds",
    EXPIRED_CARD: "Credit card has expired",
    INVALID_CARD: "Invalid credit card information",
    PROCESSING_ERROR: "Payment processing error occurred",
    REFUND_FAILED: "Refund processing failed",
  },

  // ============= DATABASE DUPLICATE KEY MESSAGES =============
  DUPLICATE: {
    // Product domain
    name: 'A product with this name already exists',
    sku: 'This SKU is already in use',
    
    // User domain
    email: 'An account with this email already exists',
    username: 'This username is already taken',
    phone: 'This phone number is already registered',
    
    // Add more as needed
  },

} as const;
export const DERIVED_FIELD_MAPPINGS: Record<string, string> = {
  // Product domain
  slug: 'name',  // slug is auto-generated from name
  
  // Add more derived fields as needed
  // handle: 'username',
  // permalink: 'url',
} as const;
// ============= ENHANCED HTTP STATUS CODES =============

export enum HttpStatus {
  // 1xx Informational
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,

  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  PARTIAL_CONTENT = 206,

  // 3xx Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,

  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  INSUFFICIENT_STORAGE = 507,
}

// ============= ENHANCED ERROR TYPES =============

export enum ErrorType {
  // Authentication & Authorization
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",

  // Validation Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_EMAIL = "INVALID_EMAIL",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  INVALID_FORMAT = "INVALID_FORMAT",
  REQUIRED_FIELD = "REQUIRED_FIELD",
  FIELD_TOO_SHORT = "FIELD_TOO_SHORT",
  FIELD_TOO_LONG = "FIELD_TOO_LONG",

  // Resource Errors
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  ALREADY_EXISTS_ERROR = "ALREADY_EXISTS_ERROR",
  CONFLICT_ERROR = "CONFLICT_ERROR",
  GONE_ERROR = "GONE_ERROR",

  // Business Logic Errors
  BUSINESS_RULE_ERROR = "BUSINESS_RULE_ERROR",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  PRICE_MISMATCH = "PRICE_MISMATCH",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  FEATURE_DISABLED = "FEATURE_DISABLED",

  // System Errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  SERVICE_UNAVAILABLE_ERROR = "SERVICE_UNAVAILABLE_ERROR",

  // File & Upload Errors
  FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR",
  FILE_TOO_LARGE_ERROR = "FILE_TOO_LARGE_ERROR",
  UNSUPPORTED_FILE_TYPE_ERROR = "UNSUPPORTED_FILE_TYPE_ERROR",

  // Payment Errors
  PAYMENT_ERROR = "PAYMENT_ERROR",
  PAYMENT_DECLINED = "PAYMENT_DECLINED",
  CARD_EXPIRED = "CARD_EXPIRED",
  INVALID_CARD = "INVALID_CARD",

  // HTTP Method Errors
  METHOD_NOT_ALLOWED_ERROR = "METHOD_NOT_ALLOWED_ERROR",
  UNSUPPORTED_MEDIA_TYPE_ERROR = "UNSUPPORTED_MEDIA_TYPE_ERROR",
  PAYLOAD_TOO_LARGE_ERROR = "PAYLOAD_TOO_LARGE_ERROR",

  // Security Errors
  SECURITY_VIOLATION = "SECURITY_VIOLATION",
  CONSTRAINT_VIOLATION_ERROR = "CONSTRAINT_VIOLATION_ERROR",

  // Maintenance & Operational
  MAINTENANCE_MODE = "MAINTENANCE_MODE",
  NOT_IMPLEMENTED_ERROR = "NOT_IMPLEMENTED_ERROR",

  // Fallback
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}