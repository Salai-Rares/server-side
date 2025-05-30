import Product from "../models/product";
import { ClientSession, PipelineStage, Types } from "mongoose";
import { QueryFiltersObject } from "../types/product-query-filter.types";
import { IProductRepository } from "../types/product.repository.types";
import { CreateProductDto, UpdateProductDto } from "../schemas";
import { ProductEntity } from "../domain/product.entity";
import { ProductEntityToPersistanceMapper } from "../mappers/domain/entity-to-db.mapper";
import { ProductFromPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mapper";
import { IProductLean } from "../types";

class ProductRepository implements IProductRepository {
  async saveProduct(
    product: ProductEntity,
    options?: { session?: ClientSession }
  ): Promise<ProductEntity> {
    const result = ProductEntityToPersistanceMapper.mapToPersistence(product);
    const [savedProduct] = await Product.create([result], {
      session: options?.session,
    });
    const entity =
      ProductFromPersistanceToEntityMapper.fromPersistanceToEntity(
        savedProduct
      );
    return entity;
  }

  async getAvailableFilters(
    categorySlug: string
  ): Promise<Record<string, string[]>> {
    const matchStage: PipelineStage.Match = {
      $match: {
        isDeleted: false,
        categories: { $exists: true, $ne: [] },
      },
    };

    const pipeline: PipelineStage[] = [
      matchStage,
      { $unwind: "$attributes" },
      {
        $group: {
          _id: "$attributes.key",
          values: { $addToSet: "$attributes.value" },
        },
      },
      {
        $project: {
          _id: 0,
          key: "$_id",
          values: 1,
        },
      },
    ];

    const result = await Product.aggregate(pipeline);
    const filters: Record<string, string[]> = {};

    result.forEach((entry) => {
      filters[entry.key] = entry.values.flat();
    });

    return filters;
  }
}

export default ProductRepository;
