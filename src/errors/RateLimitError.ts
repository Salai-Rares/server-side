import { ApiError } from "./ApiError";

export class RateLimitError extends ApiError {
    constructor(message: string = 'Rate limit exceeded') {
      super(message, 429); // Too Many Requests
    }
  }