import { toObjectId } from "@/shared/utils";
import { ProductEntity } from "../domain/product.entity";
import Product from "../models/product";
import { ConflictingProduct, IProductRepositoryRead } from "../types/read/product-read.repository.types";
import { ProductFromPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mapper";
import { ClientSession } from "mongoose";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { IProductDocument, IProductLean } from "../types";

export class ProductReadRepository implements IProductRepositoryRead {
 async findConflictingProducts(excludeProductId: string | undefined, variantSkus: string[], variantNames: string[], options?: { session?: ClientSession; }): Promise<ConflictingProduct[]> {
     const query: any = {
      $or: [
        { sku: { $in: variantSkus } },
        { name: { $in: variantNames } },
        { "variants.sku": { $in: variantSkus } },
        { "variants.name": { $in: variantNames } },
      ],
    };
      // Exclude current product if updating
    if (excludeProductId) {
      query._id = { $ne: excludeProductId };
    }
      const conflicts = await Product.find(query)
      .select("sku name variants.sku variants.name")
      .session(options?.session || null)
      .lean();

    return conflicts.map((doc) => ({
      sku: doc.sku,
      name: doc.name,
      variants: doc.variants?.map((v: any) => ({
        sku: v.sku,
        name: v.name,
      })),
    }));
  }
  async findProductsByIds(
    ids: string[],
    options?: { session: ClientSession }
  ): Promise<ProductEntity[]> {
    if (!ids || ids.length === 0) {
      throw ApiError.badRequest(
        "Product ID list cannot be empty",
        "empty_id_list"
      );
    }
    const products = await Product.find({ _id: { $in: ids } }, null, {
      session: options?.session,
    }).lean();

    return products.map((product: IProductLean) =>
      ProductFromPersistanceToEntityMapper.fromPersistanceToEntity(product)
    );
  }
  async findProductById(
    id: string,
    options?: { session: ClientSession }
  ): Promise<ProductEntity | null> {
    const product: IProductLean = await Product.findById(toObjectId(id), null, {
      session: options?.session,
    }).lean();

    return product
      ? ProductFromPersistanceToEntityMapper.fromPersistanceToEntity(product)
      : null;
  }
}
