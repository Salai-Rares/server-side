import { ApiError } from "./ApiError";

export class TimeoutError extends ApiError {
    constructor(message: string = 'Request timed out') {
      super(message, 408); // Request Timeout
    }
  }