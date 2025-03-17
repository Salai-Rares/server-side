import { Container } from "inversify";
import { IFilterService } from "./services/types/filterService.types";
import { RequestScopedStorage } from "./services/storage/RequestScopedStorage";
import { TYPES } from "./types";
import FilterService from "./services/filters/filter.service";
import  RedisClient  from "./db/redis/redisClient";
import { IFilterCacheRepo, IFilterRepository } from "./repositories/types/filterRepository.types";
import { FilterCacheRepository } from "./repositories/decorators/FilterCacheRepository";
import FilterRepository from "./repositories/filters/filter.repository";
import { FilterCache } from "./services/cache/FilterCache";
import { IFilterCache } from "./services/types/RedisCache.interface";
import Redis ,{Redis as RedisType}from "ioredis";
import { GlobalErrorHandler } from "./middleware/error-handler";
import { ValidateAndSanitizeQueryFilters } from "./middleware/products/product.middleware";


// Create Inversify Container
const container = new Container();

// ✅ Bind IFilterService to its implementation
container.bind<IFilterService>(TYPES.FilterService).to(FilterService);

// ✅ Bind RequestScopedStorage as a singleton (single instance per request)
container.bind<RequestScopedStorage>(TYPES.RequestScopedStorage).to(RequestScopedStorage).inRequestScope();

container.bind<RedisClient>(TYPES.RedisClient).to(RedisClient).inSingletonScope();
container.bind<IFilterCacheRepo>(TYPES.FilterCacheRepository).to(FilterCacheRepository);
container.bind<IFilterRepository>(TYPES.FilterRepository).to(FilterRepository);
container.bind<IFilterCache>(TYPES.FilterCache).to(FilterCache)
const redisClient = new Redis({ host: "localhost", port: 6379 });
container.bind<RedisType>(TYPES.RedisThirdParty).toConstantValue(redisClient);
container.bind<GlobalErrorHandler>(TYPES.GlobalErrorHandler).to(GlobalErrorHandler);
container.bind<ValidateAndSanitizeQueryFilters>(TYPES.ValidateAndSanitizeQueryFilters).to(ValidateAndSanitizeQueryFilters).inSingletonScope();
export { container };