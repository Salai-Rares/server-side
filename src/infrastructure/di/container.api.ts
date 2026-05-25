// src/infrastructure/di/container.api.ts
import { Container } from "inversify";
import { applySharedBindings } from "./container.base";
import { TYPES } from "@/shared/types";

import { RequestScopedStorage } from "../../core/request-context/request-scoped.storage";
import { IFilterService } from "../../modules/product/types/filter.service.types";
import FilterService from "../../modules/product/services/product-filter.service";
import {
  IFilterCacheRepository,
  IFilterRepository,
} from "../../modules/product/types/filter.repository.types";
import { FilterCacheRepository } from "../../modules/product/repositories/decorators/filter-cache.repository";
import FilterRepository from "../../modules/product/repositories/filter.repository";
import { IFilterCache } from "../../shared/types/redis-cache.types";
import { FilterCache } from "../../modules/product/cache/product-filter.cache";

import { GlobalErrorHandler } from "../../middleware/error-handler/error-handler";
import { ValidateAndSanitizeQueryFilters } from "../../middleware/products/product.middleware";
import { ValidateParam } from "../../middleware/products/product.middleware";
import { ValidateCreateCategory } from "../../middleware/products/category.middleware";
import { ProductController } from "../../modules/product/controllers/product.controller";

import { ErrorLogger } from "../../shared/errors/api-error/ErrorLogger";
import { ErrorConverter } from "../../shared/errors/api-error/ErrorConverter";
import { RequestContextBuilder } from "../../shared/errors/api-error/RequestContextBuilder";
import { UserController } from "@/modules/users/presentation/controllers/users.controller";
import { usersModule } from "@/modules/users/infrastructure/di/users.module";
import { eventsModule } from "../events/events.module";

export function buildApiContainer(): Container {
  const container = new Container();

  applySharedBindings(container);

  // Request-scoped storage (HTTP)
  container
    .bind<RequestScopedStorage>(TYPES.RequestScopedStorage)
    .to(RequestScopedStorage)
    .inRequestScope();

  // Filter-related (API / search endpoints)
  container.bind<IFilterService>(TYPES.FilterService).to(FilterService);

  container
    .bind<IFilterCacheRepository>(TYPES.FilterCacheRepository)
    .to(FilterCacheRepository);
  container
    .bind<IFilterRepository>(TYPES.FilterRepository)
    .to(FilterRepository);
  container.bind<IFilterCache>(TYPES.FilterCache).to(FilterCache);

  // Middleware & validators
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
  container
    .bind<ValidateCreateCategory>(TYPES.ValidateCreateCategory)
    .to(ValidateCreateCategory);

  // Controller
  container.bind<ProductController>(ProductController).toSelf();
  container.bind<UserController>(UserController).toSelf();

  // HTTP error pipeline
  container
    .bind<ErrorLogger>(TYPES.ErrorLogger)
    .to(ErrorLogger)
    .inSingletonScope();
  container
    .bind<ErrorConverter>(TYPES.ErrorConverter)
    .to(ErrorConverter)
    .inSingletonScope();
  container
    .bind<RequestContextBuilder>(TYPES.RequestContextBuilder)
    .to(RequestContextBuilder)
    .inSingletonScope();

      container.load( eventsModule);
  return container;
}

// optional singleton used by your Express bootstrap:
export const apiContainer = buildApiContainer();
