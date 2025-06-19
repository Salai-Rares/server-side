import { inject, injectable } from "inversify";
import { InventoryEntity } from "../domain/inventory.entity";
import { IInventoryServiceRead } from "../types/read/inventory-read.service.types";
import { IInventoryRepositoryRead } from "../types";
import { TYPES } from "@/shared/types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@injectable()
export class InventoryReadUseCase implements IInventoryServiceRead {
  constructor(
    @inject(TYPES.InventoryRepositoryRead)
    private repo: IInventoryRepositoryRead
  ) {}
  async findInventoryById(id: string): Promise<InventoryEntity> {
    const inventory = await this.repo.findInventoryById(id);
    if (!inventory) {
      throw ApiError.notFound(
        `The inventory dosen't exist`
      );
    }
    return inventory
  }
}
