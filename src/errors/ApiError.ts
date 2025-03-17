import {BaseError} from "./BaseError";
export class ApiError extends BaseError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode, true);
  }
}
