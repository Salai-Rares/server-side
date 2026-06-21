import { CartEntity } from "../../domain/cart.entity";

export interface ICartRepository {
  findByUserId(userId: string): Promise<CartEntity | null>;
  findByGuestId(guestId: string): Promise<CartEntity | null>;
  save(entity: CartEntity): Promise<CartEntity>;
  delete(id: string): Promise<void>;
}
