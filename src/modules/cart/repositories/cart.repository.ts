import { Types } from "mongoose";
import { toObjectId } from "@/shared/utils";
import { MongoErrorUtils } from "@/shared/errors/MongoValidationError";
import { CartEntity } from "../domain/cart.entity";
import { CartOwner } from "../domain/cart-domain.types";
import { CartPersistenceToEntity } from "../domain/mappers/db-to-entity.cart.mapper";
import { CartEntityToPersistenceMapper } from "../domain/mappers/entity-to-db.cart.mapper";
import CartModel from "../models/cart.model";
import { ICartRepository } from "./types/cart.repository.types";

type OwnerFilter = { userId?: Types.ObjectId; guestId?: string };

export class CartRepository implements ICartRepository {
  private ownerFilter(owner: CartOwner): OwnerFilter {
    return "userId" in owner
      ? { userId: toObjectId(owner.userId) }
      : { guestId: owner.guestId };
  }

  async findByOwner(owner: CartOwner): Promise<CartEntity | null> {
    const doc = await CartModel.findOne(this.ownerFilter(owner)).lean();
    if (!doc) return null;
    return CartPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }

  /**
   * Atomic get-or-create keyed on the owner rather than on a freshly generated
   * _id, so two concurrent first-touch requests for the same userId/guestId
   * cannot both insert. newCartId is only consumed if an insert actually happens.
   */
  async findOrCreate(owner: CartOwner, newCartId: string): Promise<CartEntity> {
    const filter = this.ownerFilter(owner);
    try {
      const doc = await CartModel.findOneAndUpdate(
        filter,
        { $setOnInsert: { ...filter, _id: toObjectId(newCartId), items: [] } },
        { upsert: true, new: true }
      ).lean();
      return CartPersistenceToEntity.fromPersistenceToEntity(doc as any);
    } catch (err) {
      // Concurrent upserts against a unique index can still surface a transient
      // duplicate key error. The winning insert is the cart we wanted.
      if (!MongoErrorUtils.isDuplicateKeyError(err)) throw err;
      const existing = await this.findByOwner(owner);
      if (!existing) throw err;
      return existing;
    }
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
