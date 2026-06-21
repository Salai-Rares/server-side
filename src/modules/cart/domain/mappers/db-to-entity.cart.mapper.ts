import { ICartDocument } from "../../types/cart.types";
import { CartEntity } from "../cart.entity";

export class CartPersistenceToEntity {
  static fromPersistenceToEntity(model: ICartDocument): CartEntity {
    return new CartEntity({
      id: model._id.toHexString(),
      userId: model.userId?.toHexString(),
      guestId: model.guestId,
      items: (model.items || []).map((item) => ({
        productId: item.productId.toHexString(),
        variantId: item.variantId?.toHexString(),
        quantity: item.quantity,
        addedAt: item.addedAt,
      })),
      createdAt: (model as any).createdAt,
      updatedAt: (model as any).updatedAt,
    });
  }
}
