/**
 * Cart's own view of the catalog, declared by the consumer.
 *
 * Cart needs one question answered — "may this line go in a cart?" — so that is
 * the whole contract. Nothing from the product or inventory modules crosses this
 * boundary: an adapter translates their entities into this shape, which keeps
 * ProductEntity, InventoryEntity and mongoose's ClientSession out of cart.
 */
export interface ItemAvailability {
  productExists: boolean;
  /** True when the requested variant exists, or when no variant was requested. */
  variantExists: boolean;
  inStock: boolean;
  /** Units on hand. Advisory only — see the note on checkAvailability. */
  availableQuantity: number;
}

export interface ICatalogAvailabilityPort {
  /**
   * A point-in-time read, not a reservation. Stock can change between this call
   * and checkout, so the result is good enough to keep obviously-impossible
   * lines out of the cart but is not an authoritative promise of supply — that
   * check belongs at order placement, against reserved stock.
   */
  checkAvailability(productId: string, variantId?: string): Promise<ItemAvailability>;
}
