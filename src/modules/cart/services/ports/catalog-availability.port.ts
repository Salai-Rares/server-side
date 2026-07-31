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
}

export interface ICatalogAvailabilityPort {
  checkAvailability(productId: string, variantId?: string): Promise<ItemAvailability>;
}
