import { toObjectId } from "@/shared/utils";
import { ICart } from "../../types/cart.types";
import { CartEntity } from "../cart.entity";

export class CartEntityToPersistenceMapper {
  /**
   * version is deliberately absent: it is an optimistic-locking token owned by
   * the repository's save(), not a field the entity maps onto storage.
   */
  static toPersistence(
    entity: CartEntity
  ): Omit<ICart, "createdAt" | "updatedAt" | "version"> {
    return {
      _id: toObjectId(entity.id),
      userId: entity.userId ? toObjectId(entity.userId) : undefined,
      guestId: entity.guestId,
      items: entity.items.map((item) => ({
        productId: toObjectId(item.productId),
        variantId: item.variantId ? toObjectId(item.variantId) : undefined,
        quantity: item.quantity,
        addedAt: item.addedAt,
      })),
    };
  }
}
