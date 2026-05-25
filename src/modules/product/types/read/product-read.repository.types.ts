import { ClientSession } from "mongoose";
import { ProductEntity } from "../../domain/product.entity";

export interface ConflictingProduct {
  sku: string;
  name: string;
  variants?: Array<{ sku: string; name: string }>;
}


export interface IProductRepositoryRead {
  findProductById(
    id: string,
    options?: { session: ClientSession }
  ): Promise<ProductEntity | null>;
  findProductsByIds(
    ids: string[],
    options?: { session: ClientSession }
  ): Promise<ProductEntity[]>;

  findConflictingProducts(
    excludeProductId: string | undefined,
    variantSkus: string[],
    variantNames: string[],
    options?: { session?: ClientSession }
  ): Promise<ConflictingProduct[]>;
}
