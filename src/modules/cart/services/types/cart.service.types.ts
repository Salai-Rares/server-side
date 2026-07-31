import { CartEntity } from "../../domain/cart.entity";
import { CartOwner } from "../../domain/cart-domain.types";

export interface ICartService {
  getCart(owner: CartOwner): Promise<CartEntity | null>;
  addItem(owner: CartOwner, productId: string, quantity: number, variantId?: string): Promise<CartEntity>;
  removeItem(owner: CartOwner, productId: string, variantId?: string): Promise<CartEntity>;
  updateQuantity(owner: CartOwner, productId: string, quantity: number, variantId?: string): Promise<CartEntity>;
  clearCart(owner: CartOwner): Promise<CartEntity | null>;
  mergeGuestCart(userId: string, guestId: string): Promise<CartEntity>;
}
