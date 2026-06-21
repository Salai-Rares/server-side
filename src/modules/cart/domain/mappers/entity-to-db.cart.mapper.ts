import { toObjectId } from "@/shared/utils";
import { ICart } from "../../types/cart.types";
import { CartEntity } from "../cart.entity";

export class CartEntityToPersistenceMapper {
  static toPersistence(entity: CartEntity): Omit<ICart, "createdAt" | "updatedAt"> {
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
