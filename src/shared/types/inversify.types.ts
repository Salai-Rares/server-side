import { InventoryRepository } from "@/modules/inventory/repositories/inventory.repository";
import ProductRepository from "@/modules/product/repositories/product.repository";

export const TYPES = {
  RedisClient: Symbol.for("RedisClient"),
  KeyAttributesCache: Symbol.for("KeyAttributesCache"),
  ProductService: Symbol.for("ProductService"),
  FilterService: Symbol.for("FilterService"),
  CategoryService: Symbol.for("CategoryService"),
  RequestScopedStorage: Symbol.for("RequestScopedStorage"),
  FilterCacheRepository: Symbol.for("FilterCacheRepository"),
  FilterRepository: Symbol.for("FilterRepository"),
  FilterCache: Symbol.for("FilterCache"),
  CategoryRepository: Symbol.for("CategoryRepository"),
  RedisThirdParty: Symbol.for("RedisThirdParty"),
  GlobalErrorHandler: Symbol.for("GlobalErrorHandler"),
  ValidateAndSanitizeQueryFilters: Symbol.for(
    "ValidateAndSanitizeQueryFilters"
  ),
  ValidateParam: Symbol.for("ValidateParam"),
  ValidateCreateCategory: Symbol.for("ValidateCreateCategory"),
  DiskStorageStrategy: Symbol.for("DiskStorageStrategy"),
  MemoryStorageStrategy: Symbol.for("MemoryStorageStrategy"),
  FileUploadMiddlewareFactory:Symbol.for("FileUploadMiddlewareFactory"),
  ProductRepository : Symbol.for("ProductRepository"),
  ProductCreateUseCase : Symbol.for("ProductCreateUseCase"),
  InventoryRepository: Symbol.for("InventoryRepository"),
  ErrorConverter :Symbol.for("ErrorConverter"),
  RequestContextBuilder : Symbol.for("RequestContextBuilder"),
  ErrorLogger : Symbol.for("ErrorLogger")
};
