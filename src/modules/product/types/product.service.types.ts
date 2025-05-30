import { Types } from "mongoose";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
} from "../schemas/product.dto";
import { QueryFiltersObject } from "@/modules/product/types/product-query-filter.types";

export interface IProductService {
  create(data: CreateProductDto): Promise<ProductResponseDto>;

  
}
