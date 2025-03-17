import { ApiError } from "./ApiError";

export class AuthenticationError extends ApiError {
    constructor(message: string = 'Authentication failed') {
      super(message, 401); // Unauthorized
    }
  }