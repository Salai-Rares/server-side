import { ApiError } from "./ApiError";

export class ValidationError extends ApiError {
  constructor(message: string = "Invalid request data") {
    super(message, 400);
  }
}
