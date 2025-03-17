import { ApiError } from "./ApiError";

export class ConflictError extends ApiError {
    constructor(message: string = 'Conflict occurred') {
      super(message, 409); // Conflict
    }
  }