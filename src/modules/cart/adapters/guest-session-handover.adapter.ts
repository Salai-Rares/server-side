import { inject } from "inversify";
import { TYPES } from "@/shared/types";
import { ILogger } from "@/core/logger/logger.interface";
import { IGuestSessionHandover } from "@/modules/users/application/ports/guest-session-handover.port";
import { ICartService } from "../services/types/cart.service.types";

/**
 * Cart's answer to users' handover port. Swallowing failures is the contract,
 * not an oversight: a shopper who cannot merge their guest cart should still
 * end up logged in, so the error is logged rather than propagated.
 */
export class CartGuestSessionHandoverAdapter implements IGuestSessionHandover {
  constructor(
    @inject(TYPES.CartService)
    private cartService: ICartService,
    @inject(TYPES.Logger)
    private logger: ILogger
  ) {}

  async handOver(userId: string, guestId: string): Promise<void> {
    try {
      await this.cartService.mergeGuestCart(userId, guestId);
    } catch (err) {
      this.logger.error(
        "Failed to merge guest cart into user cart on authentication",
        err as Error,
        { userId, guestId }
      );
    }
  }
}
