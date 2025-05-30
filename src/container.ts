import { Container, interfaces } from "inversify";
import { IFilterService } from "./modules/product/types/filter.service.types";
import { RequestScopedStorage } from "./core/request-context/request-scoped.storage";
import { TYPES } from "@/shared/types";
import FilterService from "./modules/product/services/product-filter.service";
import RedisClient from "./db/redis/redisClient";
import {
  IFilterCacheRepository,
  IFilterRepository,
} from "./modules/product/types/filter.repository.types";
import { FilterCacheRepository } from "./modules/product/repositories/decorators/filter-cache.repository";
import FilterRepository from "./modules/product/repositories/filter.repository";
import { FilterCache } from "./modules/product/cache/product-filter.cache";
import { IFilterCache } from "./shared/types/redis-cache.types";
import Redis, { Redis as RedisType } from "ioredis";
import { GlobalErrorHandler } from "./middleware/error-handler/error-handler";
import { ValidateAndSanitizeQueryFilters } from "./middleware/products/product.middleware";
import { ValidateParam } from "./middleware/products/product.middleware";
import { ICategoryService } from "./modules/category/types/category.service.types";
import { CategoryService } from "./modules/category/services/category.service";
import { ICategoryRepository } from "@/modules/category/types";
import { CategoryRepository } from "./modules/category/repositories/category.repository";
import { ValidateCreateCategory } from "./middleware/products/category.middleware";
import { IProductRepository } from "./modules/product/types/product.repository.types";
import ProductRepository from "./modules/product/repositories/product.repository";
import { ProductCreateUseCase } from "./modules/product/services/product-create.service";
import { IInventoryRepository } from "./modules/inventory/types";
import { InventoryRepository } from "./modules/inventory/repositories/inventory.repository";
import { ProductController } from "./modules/product/controllers/product.controller";
import { ErrorLogger } from "./shared/errors/api-error/ErrorLogger";
import { ErrorConverter } from "./shared/errors/api-error/ErrorConverter";
import { ErrorDetectors } from "./shared/errors/api-error/ErrorDetectors";
import { RequestContextBuilder } from "./shared/errors/api-error/RequestContextBuilder";

// Create Inversify Container
const container = new Container();

// ✅ Bind IFilterService to its implementation
container.bind<IFilterService>(TYPES.FilterService).to(FilterService);

// ✅ Bind RequestScopedStorage as a singleton (single instance per request)
container
  .bind<RequestScopedStorage>(TYPES.RequestScopedStorage)
  .to(RequestScopedStorage)
  .inRequestScope();

container
  .bind<RedisClient>(TYPES.RedisClient)
  .to(RedisClient)
  .inSingletonScope();
container
  .bind<IFilterCacheRepository>(TYPES.FilterCacheRepository)
  .to(FilterCacheRepository);
container.bind<IFilterRepository>(TYPES.FilterRepository).to(FilterRepository);
container.bind<IFilterCache>(TYPES.FilterCache).to(FilterCache);
const redisClient = new Redis({ host: "localhost", port: 6379 });
container.bind<RedisType>(TYPES.RedisThirdParty).toConstantValue(redisClient);
container
  .bind<GlobalErrorHandler>(TYPES.GlobalErrorHandler)
  .to(GlobalErrorHandler)
  .inSingletonScope();
container
  .bind<ValidateAndSanitizeQueryFilters>(TYPES.ValidateAndSanitizeQueryFilters)
  .to(ValidateAndSanitizeQueryFilters)
  .inSingletonScope();
container
  .bind<ValidateParam>(TYPES.ValidateParam)
  .to(ValidateParam)
  .inSingletonScope();
container.bind<ICategoryService>(TYPES.CategoryService).to(CategoryService);
container
  .bind<ICategoryRepository>(TYPES.CategoryRepository)
  .to(CategoryRepository);
container
  .bind<ValidateCreateCategory>(TYPES.ValidateCreateCategory)
  .to(ValidateCreateCategory)
  .inSingletonScope();
container
  .bind<IProductRepository>(TYPES.ProductRepository)
  .to(ProductRepository)
  .inSingletonScope();
container
  .bind<ProductCreateUseCase>(TYPES.ProductCreateUseCase)
  .to(ProductCreateUseCase)
  .inSingletonScope();
container
  .bind<IInventoryRepository>(TYPES.InventoryRepository)
  .to(InventoryRepository)
  .inSingletonScope();
  container.bind<ProductController>(ProductController).toSelf();
  container.bind<ErrorLogger>(TYPES.ErrorLogger).to(ErrorLogger).inSingletonScope();
  container.bind<ErrorConverter>(TYPES.ErrorConverter).to(ErrorConverter).inSingletonScope();
  container.bind<RequestContextBuilder>(TYPES.RequestContextBuilder).to(RequestContextBuilder).inSingletonScope();
export { container };
