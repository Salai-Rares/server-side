import Product, { IProduct } from "../../models/product";
import { PipelineStage, Types } from "mongoose";
import { AllUniqueKeyAndValuesFilters, QueryFilter } from "../../types/product";
import { IProductRepository } from "../types/productRepository.types";



// class ProductRepository implements IProductRepository{
//   /**
//    * Save a new product to the database.
//    * @param data The validated product data.
//    * @returns The saved product document.
//    */
//   async create(
//     data: Record<string, any>
//   ): Promise<IProduct & { _id: Types.ObjectId }> {
//     const product = new Product(data);
//     return await product.save();
//   }
// }

// export default ProductRepository;
