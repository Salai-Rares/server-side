import { Types } from "mongoose";
import { toObjectId } from "@/shared/utils";
import { MongoErrorUtils } from "@/shared/errors/MongoValidationError";
import { CartVersionConflictError } from "../errors/cart-version-conflict.error";
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
        {
          $setOnInsert: {
            ...filter,
            _id: toObjectId(newCartId),
            items: [],
            version: 0,
          },
        },
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

  /**
   * Optimistic write: the filter pins the revision this entity was read at, so a
   * save built from stale items matches nothing rather than overwriting whoever
   * got there first. No upsert — with a version in the filter a mismatch would
   * insert a second cart instead of failing.
   */
  async save(entity: CartEntity): Promise<CartEntity> {
    // _id stays in the filter and out of the update: it is immutable, and
    // whether Mongoose strips it from a non-upsert $set is not worth relying on.
    const { _id, ...updatable } = CartEntityToPersistenceMapper.toPersistence(entity);
    const doc = await CartModel.findOneAndUpdate(
      { _id, version: entity.version },
      { $set: { ...updatable, version: entity.version + 1 } },
      { new: true }
    ).lean();

    if (!doc) throw new CartVersionConflictError(entity.id);

    return CartPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }

  async delete(id: string): Promise<void> {
    await CartModel.findByIdAndDelete(toObjectId(id));
  }
}
