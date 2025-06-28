import { inject, injectable } from "inversify";
import { InventoryEntity } from "../domain/inventory.entity";
import { CreateInventoryType } from "../schemas/create-inventory.dto";

import { IInventoryServiceCreate } from "../types/create/inventory-create.service.types";
import { TYPES } from "@/shared/types";
import { IInventoryRepositoryWrite, IInventoryServiceRead } from "../types";
import { ClientSession } from "mongoose";
import { IProductReadService } from "@/modules/product/types/read/read-product.service.types";
import { ProductEntity } from "@/modules/product/domain/product.entity";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { newHexStringId } from "@/shared/utils";
import { InventoryDtoToEntityMapper } from "../mappers/domain/dto-to-entity.mapper";

@injectable()
export class InventoryCreateUseCase implements IInventoryServiceCreate {
  constructor(
    @inject(TYPES.ProductReadUseCase)
    private productReadService: IProductReadService,
    @inject(TYPES.InventoryReadUseCase)
    private inventoryReadService: IInventoryServiceRead,
    @inject(TYPES.InventoryRepositoryWrite)
    private inventoryRepositoryWrite: IInventoryRepositoryWrite
  ) {}
  async saveInventory(
    inventory: CreateInventoryType,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity> {
    const product: ProductEntity | null =
      await this.productReadService.findProductById(
        inventory.referenceRootId,
        options
      );

    if (!product) {
      throw ApiError.notFound("Requested product does not exist", inventory.referenceRootId);
    }
    if (inventory.referenceVariantId) {
      const variantExists = product.variants?.some(
        (variant) => variant.id === inventory.referenceVariantId
      );

      if (!variantExists) {
        throw ApiError.notFound(
          `Variant ${inventory.referenceVariantId} not found in product ${inventory.referenceRootId}`
        );
      }
    }

    const hasRootInventory = !inventory.referenceVariantId;
    const allInventories =
      await this.inventoryReadService.findInventoriesByProductId(
        inventory.referenceRootId,
        options
      );

    if (hasRootInventory && allInventories.length > 0) {
      throw ApiError.businessRuleViolation(
        "Cannot add root inventory when variant inventories already exist",
        "root_inventory_conflict"
      );
    }

    if (
      !hasRootInventory &&
      allInventories.some((i) => !i.referenceVariantId)
    ) {
      throw ApiError.businessRuleViolation(
        "Cannot add variant inventory when root inventory already exists",
        "variant_inventory_conflict"
      );
    }
    const inventoryEntity = new InventoryEntity({
      id: newHexStringId(),
      ...InventoryDtoToEntityMapper.mapToEntity(inventory),
    });
    return await this.inventoryRepositoryWrite.saveInventory(
      inventoryEntity,
      options
    );
  }
  async saveBulkInventories(
    inventories: CreateInventoryType[],
    options?: { session: ClientSession }
  ): Promise<InventoryEntity[]> {
    if (!inventories || inventories.length === 0) {
      throw ApiError.businessRuleViolation(
        "Inventory list cannot be empty",
        "list_not_empty"
      );
    }

    const productIds = [
      ...new Set(inventories.map((inventory) => inventory.referenceRootId)),
    ];

    const products = await this.productReadService.findProductsByIds(
      productIds,
      options
    );

    const productMap = new Map(products.map((p) => [p.id, p]));

    this.validateBulkReferences(inventories, productMap);
    await this.ensureNoRootVariantConflict(inventories, options);
    const inventoryEntities = inventories.map(
      (inventory) =>
        new InventoryEntity({
          id: newHexStringId(),
          ...InventoryDtoToEntityMapper.mapToEntity(inventory),
        })
    );

    return await this.inventoryRepositoryWrite.saveBulkInventories(
      inventoryEntities,
      options
    );
  }

  private validateBulkReferences(
    inventories: CreateInventoryType[],
    productMap: Map<string, ProductEntity>
  ): void {
    // Check for missing products
    const missingProductIds: string[] = [];
    const variantValidationErrors: string[] = [];

    for (const inventory of inventories) {
      // Check if product exists
      const product = productMap.get(inventory.referenceRootId);
      if (!product) {
        missingProductIds.push(inventory.referenceRootId);
        continue; // Skip variant validation if product doesn't exist
      }

      // Check variant if specified
      if (inventory.referenceVariantId) {
        const variantExists = product.variants?.some(
          (variant) => variant.id === inventory.referenceVariantId
        );

        if (!variantExists) {
          variantValidationErrors.push(
            `Variant ${inventory.referenceVariantId} not found in product ${inventory.referenceRootId}`
          );
        }
      }
    }

    // Throw errors if any validation failed
    if (missingProductIds.length > 0) {
      throw ApiError.notFound(
        `Products not found: ${missingProductIds.join(", ")}`
      );
    }

    if (variantValidationErrors.length > 0) {
      throw ApiError.notFound(variantValidationErrors.join("; "));
    }

    // Check for duplicate inventory references
    this.validateNoDuplicateReferences(inventories);
  }

  private validateNoDuplicateReferences(
    inventories: CreateInventoryType[]
  ): void {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const inventory of inventories) {
      // Create unique key for each inventory reference
      const key = inventory.referenceVariantId
        ? `${inventory.referenceRootId}:${inventory.referenceVariantId}`
        : inventory.referenceRootId;

      if (seen.has(key)) {
        duplicates.push(key);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      throw ApiError.businessRuleViolation(
        `Duplicate inventory references found: ${duplicates.join(", ")}`,
        "no_duplicates"
      );
    }
  }

  private async ensureNoRootVariantConflict(
    inventories: CreateInventoryType[],
    options?: { session: ClientSession }
  ): Promise<void> {
    const productIds = [
      ...new Set(inventories.map((inv) => inv.referenceRootId)),
    ];

    const existingInventories =
      await this.inventoryReadService.findInventoriesByProductsIds(
        productIds,
        options
      );

    const existingMap = new Map<string, InventoryEntity[]>();
    for (const inv of existingInventories) {
      const list = existingMap.get(inv.referenceRootId) || [];
      list.push(inv);
      existingMap.set(inv.referenceRootId, list);
    }

    for (const inventory of inventories) {
      const existing = existingMap.get(inventory.referenceRootId) || [];
      const isRootInventory = !inventory.referenceVariantId;
      const hasRoot = existing.some((e) => !e.referenceVariantId);
      const hasVariants = existing.some((e) => e.referenceVariantId);

      if (isRootInventory && hasVariants) {
        throw ApiError.businessRuleViolation(
          `Cannot add root inventory for product ${inventory.referenceRootId} — variant inventories already exist`,
          "root_inventory_conflict"
        );
      }

      if (!isRootInventory && hasRoot) {
        throw ApiError.businessRuleViolation(
          `Cannot add variant inventory for product ${inventory.referenceRootId} — root inventory already exists`,
          "variant_inventory_conflict"
        );
      }
    }
  }
}
