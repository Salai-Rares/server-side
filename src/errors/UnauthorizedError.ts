import { ApiError } from "./ApiError";

export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized') {
      super(message, 401);
    }
  }