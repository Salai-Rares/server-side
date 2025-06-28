import { inject, injectable } from "inversify";
import { InventoryEntity } from "../domain/inventory.entity";
import { IInventoryServiceRead } from "../types/read/inventory-read.service.types";
import { IInventoryRepositoryRead } from "../types";
import { TYPES } from "@/shared/types";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ClientSession } from "mongoose";

@injectable()
export class InventoryReadUseCase implements IInventoryServiceRead {
  constructor(
    @inject(TYPES.InventoryRepositoryRead)
    private repo: IInventoryRepositoryRead
  ) {}
  async findInventoryByReferences(referenceRootId: string, referenceVariantId?: string, options?: { session: ClientSession; }): Promise<InventoryEntity | null> {
    const inventory = await this.findInventoryByReferences(referenceRootId,referenceVariantId,options)
    return inventory
  }
  async findInventoriesByProductsIds(ids: string[], options?: { session: ClientSession; }): Promise<InventoryEntity[]> {
    const inventories = await this.repo.findInventoriesByProductsIds(ids,options)
    return inventories;
  }
  async findInventoryById(id: string ,
      options?: { session: ClientSession }): Promise<InventoryEntity | null> {
    const inventory = await this.repo.findInventoryById(id,options);
    
    return inventory;
  }

  async findInventoriesByProductId(id: string,
    options?: { session: ClientSession }): Promise<InventoryEntity[]> {
    const inventories = await this.repo.findInventoriesByProductId(id,options);
    return inventories;
  }
}
