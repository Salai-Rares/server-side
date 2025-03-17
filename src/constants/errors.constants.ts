export const ERROR_MESSAGES = {
    USERNAME: {
      MIN_LENGTH: "Username must be at least 5 characters long",
      NO_SPECIAL_CHARS: "Username must not contain special characters",
    },
    PASSWORD: {
      MIN_LENGTH: "Password must be at least 8 characters long",
      UPPERCASE: "Password must contain at least one uppercase letter",
      LOWERCASE: "Password must contain at least one lowercase letter",
      NUMBER: "Password must contain at least one number",
    },
    EMAIL: {
      INVALID: "Please enter a valid email address",
    },
  } as const;