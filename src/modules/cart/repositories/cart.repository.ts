import { toObjectId } from "@/shared/utils";
import { CartEntity } from "../domain/cart.entity";
import { CartPersistenceToEntity } from "../domain/mappers/db-to-entity.cart.mapper";
import { CartEntityToPersistenceMapper } from "../domain/mappers/entity-to-db.cart.mapper";
import CartModel from "../models/cart.model";
import { ICartRepository } from "./types/cart.repository.types";

export class CartRepository implements ICartRepository {
  async findByUserId(userId: string): Promise<CartEntity | null> {
    const doc = await CartModel.findOne({ userId: toObjectId(userId) }).lean();
    if (!doc) return null;
    return CartPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }

  async findByGuestId(guestId: string): Promise<CartEntity | null> {
    const doc = await CartModel.findOne({ guestId }).lean();
    if (!doc) return null;
    return CartPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }

  async save(entity: CartEntity): Promise<CartEntity> {
    const data = CartEntityToPersistenceMapper.toPersistence(entity);
    const doc = await CartModel.findByIdAndUpdate(
      data._id,
      { $set: data },
      { new: true, upsert: true }
    ).lean();
    return CartPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }

  async delete(id: string): Promise<void> {
    await CartModel.findByIdAndDelete(toObjectId(id));
  }
}
