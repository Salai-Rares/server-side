import { ClientSession } from "mongoose";
import { ProductEntity } from "../domain/product.entity";

import {
  CreateProductDto,
  UpdateProductDto,
} from "../schemas/product.dto";
import { QueryFiltersObject } from "@/modules/product/types/product-query-filter.types";

export interface IProductRepository {
  saveProduct(product : ProductEntity,options?: { session?: ClientSession }):Promise<ProductEntity>;
}
