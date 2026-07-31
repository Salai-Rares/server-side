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
  createdAt?: Date;
  updatedAt?: Date;
}
