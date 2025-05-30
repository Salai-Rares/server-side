import { injectable } from "inversify";
import { IProductService } from "../types/product.service.types";
import { QueryFiltersObject } from "../types/product-query-filter.types";
import { CreateProductDto, ProductResponseDto, UpdateProductDto } from "../schemas";

@injectable()
export class ProductService implements IProductService{
    constructor(){

    }
    create(data: CreateProductDto): Promise<ProductResponseDto> {
        throw new Error("Method not implemented.");
    }
    
  

}