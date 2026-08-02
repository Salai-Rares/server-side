export type CartOwner = { userId: string } | { guestId: string };

export interface CartItemProps {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: Date;
}

export interface CartProps {
  id: string;
  userId?: string;
  guestId?: string;
  items: CartItemProps[];
  /**
   * Optimistic concurrency token, as read from storage. Required: an entity is
   * only ever built from a persisted document, and a save cannot be made safe
   * without knowing which revision it started from.
   */
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}
