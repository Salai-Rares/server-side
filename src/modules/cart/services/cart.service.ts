import { inject } from "inversify";
import { TYPES } from "@/shared/types";
import { CartEntity } from "../domain/cart.entity";
import { CartOwner } from "../domain/cart-domain.types";
import { ICartRepository } from "../repositories/types/cart.repository.types";
import { ICatalogAvailabilityPort, ItemAvailability } from "./ports/catalog-availability.port";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
import { ICartService } from "./types/cart.service.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { CartVersionConflictError } from "../errors/cart-version-conflict.error";

/** Conflicts are rare and self-resolving; a small bound avoids masking a livelock. */
const MAX_SAVE_ATTEMPTS = 3;

export class CartService implements ICartService {
  constructor(
    @inject(TYPES.CartRepository)
    private cartRepo: ICartRepository,
    @inject(TYPES.CartCatalogAvailability)
    private catalog: ICatalogAvailabilityPort,
    @inject(TYPES.IdGenerator)
    private idGenerator: IIdGenerator
  ) {}

  /** Read-only: a shopper who has never added anything simply has no cart. */
  async getCart(owner: CartOwner): Promise<CartEntity | null> {
    return this.cartRepo.findByOwner(owner);
  }

  async addItem(
    owner: CartOwner,
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<CartEntity> {
    const availability = await this.catalog.checkAvailability(productId, variantId);
    this.assertAvailable(availability);

    return this.retryOnConflict(async () => {
      const cart = await this.getOrCreateCart(owner);
      // addItem accumulates, so the line total is what has to fit in stock —
      // not the delta the shopper just asked for.
      const lineTotal = cart.quantityOf(productId, variantId) + quantity;
      this.assertQuantityInStock(lineTotal, availability.availableQuantity);

      cart.addItem(productId, quantity, variantId);
      return this.cartRepo.save(cart);
    });
  }

  async removeItem(
    owner: CartOwner,
    productId: string,
    variantId?: string
  ): Promise<CartEntity> {
    return this.retryOnConflict(async () => {
      const cart = await this.requireCart(owner);
      cart.removeItem(productId, variantId);
      return this.cartRepo.save(cart);
    });
  }

  async updateQuantity(
    owner: CartOwner,
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<CartEntity> {
    const availability = await this.catalog.checkAvailability(productId, variantId);
    this.assertAvailable(availability);
    // Absolute set, so the requested quantity is the line total.
    this.assertQuantityInStock(quantity, availability.availableQuantity);

    return this.retryOnConflict(async () => {
      const cart = await this.requireCart(owner);
      cart.updateQuantity(productId, quantity, variantId);
      return this.cartRepo.save(cart);
    });
  }

  /** Idempotent: clearing a cart that does not exist is already satisfied. */
  async clearCart(owner: CartOwner): Promise<CartEntity | null> {
    return this.retryOnConflict(async () => {
      const cart = await this.cartRepo.findByOwner(owner);
      if (!cart) return null;
      cart.clear();
      return this.cartRepo.save(cart);
    });
  }

  async mergeGuestCart(userId: string, guestId: string): Promise<CartEntity> {
    const guestCart = await this.cartRepo.findByOwner({ guestId });
    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart({ userId });
    }

    const incoming = guestCart.items;
    const merged = await this.retryOnConflict(async () => {
      const userCart = await this.getOrCreateCart({ userId });
      userCart.mergeItems(incoming);
      return this.cartRepo.save(userCart);
    });

    // Only once the merge has landed — deleting first would lose the guest's
    // items outright if the save then failed.
    await this.cartRepo.delete(guestCart.id);
    return merged;
  }

  /**
   * Re-runs a read-mutate-save block when someone else wrote the cart first.
   * The retry re-reads current state and re-applies the intent, so a losing
   * writer contributes its change instead of silently overwriting or failing.
   * Only the cart round trip is retried — catalog lookups stay outside.
   */
  private async retryOnConflict<T>(operation: () => Promise<T>): Promise<T> {
    let lastConflict: CartVersionConflictError | undefined;

    for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt++) {
      try {
        return await operation();
      } catch (err) {
        if (!(err instanceof CartVersionConflictError)) throw err;
        lastConflict = err;
      }
    }

    throw lastConflict;
  }

  /** Only for operations where a cart coming into existence is meaningful. */
  private getOrCreateCart(owner: CartOwner): Promise<CartEntity> {
    return this.cartRepo.findOrCreate(owner, this.idGenerator.generate());
  }

  private assertAvailable(availability: ItemAvailability): void {
    if (!availability.productExists) throw ApiError.notFound("Product not found");
    if (!availability.variantExists) throw ApiError.notFound("Product variant not found");
    if (!availability.inStock) throw ApiError.badRequest("Product is out of stock");
  }

  private assertQuantityInStock(lineTotal: number, availableQuantity: number): void {
    if (lineTotal > availableQuantity) {
      throw ApiError.badRequest(
        `Only ${availableQuantity} in stock, ${lineTotal} requested`
      );
    }
  }

  private async requireCart(owner: CartOwner): Promise<CartEntity> {
    const cart = await this.cartRepo.findByOwner(owner);
    if (!cart) throw ApiError.notFound("Cart not found");
    return cart;
  }
}
