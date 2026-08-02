import { HttpStatus, ErrorType } from "@/constants";
import { ApiError } from "@/shared/errors/api-error/ApiError";

/**
 * Raised when a save is built from a cart revision that someone else has since
 * overwritten. Its own class rather than a bare ApiError.conflict so the service
 * can retry on exactly this condition instead of sniffing status codes.
 */
export class CartVersionConflictError extends ApiError {
  constructor(cartId: string) {
    super(
      "Cart was modified concurrently",
      HttpStatus.CONFLICT,
      ErrorType.CONFLICT_ERROR,
      { cartId },
      undefined,
      true
    );
  }
}
