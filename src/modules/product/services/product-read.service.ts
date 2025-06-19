import { ILogger } from "@/core/logger/logger.interface";
import { IInventoryRepositoryWrite } from "@/modules/inventory/types";
import { TYPES } from "@/shared/types";
import { injectable, inject } from "inversify";

import { ProductEntity } from "../domain/product.entity";
import { IProductReadService } from "../types/read/read-product.service.types";
import { IProductRepositoryRead } from "../types/read/product-read.repository.types";
import { ClientSession } from "mongoose";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@injectable()
export class ProductReadUseCase implements IProductReadService {
  constructor(
    @inject(TYPES.ProductReadRepository)
    private productReadRepository: IProductRepositoryRead,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}
  async findProductById(
    id: string,
    options?: { session: ClientSession }
  ): Promise<ProductEntity> {
    const product = await this.productReadRepository.findProductById(
      id,
      options
    );
    if (!product) {
      throw ApiError.notFound("Requested product does not exist", id);
    }
    return product;
  }

  async findProductsByIds(
    ids: string[],
    options?: { session: ClientSession }
  ): Promise<ProductEntity[]> {
    const products = await this.productReadRepository.findProductsByIds(
      ids,
      options
    );

    if (products.length !== ids.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw ApiError.notFound(`Products not found: ${missingIds.join(", ")}`);
    }

    return products;
  }
}
