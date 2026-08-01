import { inject } from "inversify";
import { TYPES } from "@/shared/types";
import { IProductRepositoryRead } from "@/modules/product/types/read/product-read.repository.types";
import { IInventoryRepositoryRead } from "@/modules/inventory/types/read/inventory-read.repository.types";
import { ProductEntity } from "@/modules/product/domain/product.entity";
import { ValidationError } from "@/shared/errors/ValidationError";
import {
  ICatalogAvailabilityPort,
  ItemAvailability,
} from "../services/ports/catalog-availability.port";

const PRODUCT_MISSING: ItemAvailability = {
  productExists: false,
  variantExists: false,
  inStock: false,
  availableQuantity: 0,
};

/**
 * The single place allowed to know both cart's port and the product/inventory
 * modules. Everything cart would otherwise couple to is confined to this file.
 */
export class CatalogAvailabilityAdapter implements ICatalogAvailabilityPort {
  constructor(
    @inject(TYPES.ProductReadRepository)
    private productRepo: IProductRepositoryRead,
    @inject(TYPES.InventoryRepositoryRead)
    private inventoryRepo: IInventoryRepositoryRead
  ) {}

  async checkAvailability(
    productId: string,
    variantId?: string
  ): Promise<ItemAvailability> {
    const product = await this.productRepo.findProductById(productId);
    if (!product) return PRODUCT_MISSING;

    if (variantId && !this.hasVariant(product, variantId)) {
      return {
        productExists: true,
        variantExists: false,
        inStock: false,
        availableQuantity: 0,
      };
    }

    const inventory = await this.inventoryRepo.findInventoryByReferences(
      productId,
      variantId
    );

    return {
      productExists: true,
      variantExists: true,
      inStock: Boolean(inventory?.inStock),
      availableQuantity: inventory?.stock ?? 0,
    };
  }

  /**
   * getVariantById signals absence by throwing. That is product's convention,
   * not cart's, so it is translated into a boolean here rather than escaping
   * across the boundary as someone else's ValidationError.
   */
  private hasVariant(product: ProductEntity, variantId: string): boolean {
    try {
      product.getVariantById(variantId);
      return true;
    } catch (err) {
      if (err instanceof ValidationError) return false;
      throw err;
    }
  }
}
