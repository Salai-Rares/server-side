import { CartEntity } from "../../domain/cart.entity";
import { CartOwner } from "../../domain/cart-domain.types";

export interface ICartRepository {
  findByOwner(owner: CartOwner): Promise<CartEntity | null>;
  findOrCreate(owner: CartOwner, newCartId: string): Promise<CartEntity>;
  save(entity: CartEntity): Promise<CartEntity>;
  delete(id: string): Promise<void>;
}
