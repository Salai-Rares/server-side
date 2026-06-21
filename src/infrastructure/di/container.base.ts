// src/infrastructure/di/container.base.ts
import { Container } from "inversify";
import { TYPES } from "@/shared/types";
import Redis, { Redis as RedisType } from "ioredis";

// imports of SHARED stuff
import RedisClient from "../../db/redis/redisClient"; // if used in domain/background too
import { RedisCache } from "../cache/redis.cache";
import { ICache } from "../../core/application/ports/cache/IRedisCache";
import { ILogger } from "../../core/logger/logger.interface";
import { LoggerService } from "../../core/logger/logger.service";

import { ICategoryService } from "../../modules/category/types/category.service.types";
import { CategoryService } from "../../modules/category/services/category.service";
import { ICategoryRepository } from "@/modules/category/types";
import { CategoryRepository } from "../../modules/category/repositories/category.repository";

import { IProductRepositoryWrite } from "../../modules/product/types/create/product-write.repository.types";
import { IProductRepositoryRead } from "../../modules/product/types/read/product-read.repository.types";
import { IProductRepositoryUpdate } from "../../modules/product/types/update/product-update.repository.types";
import ProductRepository from "../../modules/product/repositories/product-write.repository";
import { ProductReadRepository } from "../../modules/product/repositories/product-read.repository";
import { ProductRepositoryUpdate } from "../../modules/product/repositories/product-update.repository";

import { IProductCreateService } from "../../modules/product/types";
import { ProductCreateUseCase } from "../../modules/product/services/product-create.service";
import { IProductReadService } from "../../modules/product/types/read/read-product.service.types";
import { ProductReadUseCase } from "../../modules/product/services/product-read.service";
import { IProductUpdateService } from "../../modules/product/types/update/product-update.service.types";
import { ProductUpdateUseCase } from "../../modules/product/services/product-update.service";

import {
  IInventoryRepositoryWrite,
  IInventoryRepositoryRead,
  IInventoryServiceRead,
} from "../../modules/inventory/types";
import { InventoryRepositoryWrite } from "../../modules/inventory/repositories/inventory-write.repository";
import { InventoryRepositoryRead } from "../../modules/inventory/repositories/inventory-read.repository";

import { IInventoryServiceCreate } from "../../modules/inventory/types/create/inventory-create.service.types";
import { InventoryCreateUseCase } from "../../modules/inventory/services/inventory-create.service";

import { IInventoryRepositoryUpdate } from "../../modules/inventory/types/update/inventory-update.repository.types";
import { InventoryRepositoryUpdate } from "../../modules/inventory/repositories/inventory-update.repository";
import { IInventoryServiceUpdate } from "../../modules/inventory/types/update/inventory-update.service.types";
import { InventoryUpdateUseCase } from "../../modules/inventory/services/inventory-update.service";

import { IInventoryRepositoryDelete } from "../../modules/inventory/types/delete/inventory-delete.repository.types";
import { InventoryRepositoryDelete } from "../../modules/inventory/repositories/inventory-delete.repository";
import { IInventoryServiceDelete } from "../../modules/inventory/types/delete/inventory-delete.service.types";
import { InventoryDeleteUseCase } from "../../modules/inventory/services/inventory-delete.service";

import { IDiscountCreateRepository } from "../../modules/discount/repositories/types/discount-create.repository.types";
import { CreateDiscountRepository } from "../../modules/discount/repositories/discount-create.repository";
import { IDiscountReadRepository } from "../../modules/discount/repositories/types/discount-read.repository.types";
import { DiscountReadRepository } from "../../modules/discount/repositories/discount-read.repository";
import { IDiscountUpdateRepository } from "../../modules/discount/repositories/types/discount-update.repository.types";
import { DiscountUpdateRepository } from "../../modules/discount/repositories/discount-update.repository";
import { IDiscountCreateService } from "../../modules/discount/services/types/discount-create.service.types";
import { CreateDiscountService } from "../../modules/discount/services/discount-create.service";
import { IDiscountUpdateService } from "../../modules/discount/services/types/discount-update.service.types";
import { UpdateDiscountService } from "../../modules/discount/services/discount-update.service";
import { IDiscountEngine } from "../../modules/discount/engine/types/engine.types";
import { DiscountEngine } from "../../modules/discount/engine/discount-engine";

import { ICouponCreateRepository } from "../../modules/coupon/repositories/types/coupon-create.repository.types";
import { CouponCreateRepository } from "../../modules/coupon/repositories/coupon-create.repository";
import { ICouponReadRepository } from "../../modules/coupon/repositories/types/coupon-read.repository.types";
import { CouponReadRepository } from "../../modules/coupon/repositories/coupon-read.repository";
import { ICouponUpdateRepository } from "../../modules/coupon/repositories/types/coupon-update.repository.types";
import { CouponUpdateRepository } from "../../modules/coupon/repositories/coupon-update.repository";
import { ICouponCreateService } from "../../modules/coupon/services/types/coupon-create.service.types";
import { CouponCreateService } from "../../modules/coupon/services/coupon-create.service";
import { ICouponUpdateService } from "../../modules/coupon/services/types/coupon-update.service.types";
import { CouponUpdateService } from "../../modules/coupon/services/coupon-update.service";

import { ProductVariantUniquenessValidator } from "../../modules/product/validators/product-variant-uniqueness.validator";

import { IEmailService } from "../../core/application/ports/email/email-service.interface";
import { EmailServiceAdapter } from "../email/services/email-adapter.service";
import { ITokenService } from "../../core/application/ports/email/email-token-service.interface";
import { TokenService } from "../../core/application/services/token/confirmation-token.service";

import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
import { MongoIdGenerator } from "../id/mongo-id-generator";

import { usersModule } from "../../modules/users/infrastructure/di/users.module";

import { InventoryReadUseCase } from "@/modules/inventory/services/inventory-read.service";
import { outboxModule } from "../events/outbox/outbox.module";
import { emailModule } from "../email/email.module";
import { ServerClient } from "postmark";
export function applySharedBindings(container: Container): void {
  // Redis (low-level ioredis instance)
  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });
  container.bind<RedisType>(TYPES.RedisThirdParty).toConstantValue(redisClient);

  // Postmark client

  // Optional: custom RedisClient (if used beyond API)
  container
    .bind<RedisClient>(TYPES.RedisClient)
    .to(RedisClient)
    .inSingletonScope();

  // Shared cache
  container.bind<ICache>(TYPES.RedisCache).to(RedisCache).inSingletonScope();

  // Logger
  container.bind<ILogger>(TYPES.Logger).to(LoggerService).inSingletonScope();

  // Categories
  container.bind<ICategoryService>(TYPES.CategoryService).to(CategoryService);
  container
    .bind<ICategoryRepository>(TYPES.CategoryRepository)
    .to(CategoryRepository);

  // Products
  container
    .bind<IProductRepositoryWrite>(TYPES.ProductWriteRepository)
    .to(ProductRepository)
    .inSingletonScope();
  container
    .bind<IProductRepositoryRead>(TYPES.ProductReadRepository)
    .to(ProductReadRepository)
    .inSingletonScope();
  container
    .bind<IProductRepositoryUpdate>(TYPES.ProductRepositoryUpdate)
    .to(ProductRepositoryUpdate)
    .inSingletonScope();

  container
    .bind<IProductCreateService>(TYPES.ProductCreateUseCase)
    .to(ProductCreateUseCase)
    .inSingletonScope();
  container
    .bind<IProductReadService>(TYPES.ProductReadUseCase)
    .to(ProductReadUseCase)
    .inSingletonScope();
  container
    .bind<IProductUpdateService>(TYPES.ProductUpdateUseCase)
    .to(ProductUpdateUseCase)
    .inSingletonScope();

  // Inventory
  container
    .bind<IInventoryRepositoryWrite>(TYPES.InventoryRepositoryWrite)
    .to(InventoryRepositoryWrite)
    .inSingletonScope();
  container
    .bind<IInventoryRepositoryRead>(TYPES.InventoryRepositoryRead)
    .to(InventoryRepositoryRead)
    .inSingletonScope();
  container
    .bind<IInventoryRepositoryUpdate>(TYPES.InventoryRepositoryUpdate)
    .to(InventoryRepositoryUpdate)
    .inSingletonScope();
  container
    .bind<IInventoryRepositoryDelete>(TYPES.InventoryRepositoryDelete)
    .to(InventoryRepositoryDelete)
    .inSingletonScope();

  container
    .bind<IInventoryServiceCreate>(TYPES.InventoryCreateUseCase)
    .to(InventoryCreateUseCase)
    .inSingletonScope();
  container
    .bind<IInventoryServiceRead>(TYPES.InventoryReadUseCase)
    .to(InventoryReadUseCase)
    .inSingletonScope();
  container
    .bind<IInventoryServiceUpdate>(TYPES.InventoryUpdateUseCase)
    .to(InventoryUpdateUseCase)
    .inSingletonScope();
  container
    .bind<IInventoryServiceDelete>(TYPES.InventoryDeleteUseCase)
    .to(InventoryDeleteUseCase)
    .inSingletonScope();

  // Discounts
  container
    .bind<IDiscountCreateRepository>(TYPES.CreateDiscountRepository)
    .to(CreateDiscountRepository)
    .inSingletonScope();
  container
    .bind<IDiscountReadRepository>(TYPES.DiscountReadRepository)
    .to(DiscountReadRepository)
    .inSingletonScope();
  container
    .bind<IDiscountUpdateRepository>(TYPES.DiscountUpdateRepository)
    .to(DiscountUpdateRepository)
    .inSingletonScope();
  container
    .bind<IDiscountCreateService>(TYPES.DiscountCreateService)
    .to(CreateDiscountService)
    .inSingletonScope();
  container
    .bind<IDiscountUpdateService>(TYPES.DiscountUpdateService)
    .to(UpdateDiscountService)
    .inSingletonScope();
  container
    .bind<IDiscountEngine>(TYPES.DiscountEngine)
    .to(DiscountEngine)
    .inSingletonScope();

  // Coupons
  container
    .bind<ICouponCreateRepository>(TYPES.CouponCreateRepository)
    .to(CouponCreateRepository)
    .inSingletonScope();
  container
    .bind<ICouponReadRepository>(TYPES.CouponReadRepository)
    .to(CouponReadRepository)
    .inSingletonScope();
  container
    .bind<ICouponUpdateRepository>(TYPES.CouponUpdateRepository)
    .to(CouponUpdateRepository)
    .inSingletonScope();
  container
    .bind<ICouponCreateService>(TYPES.CouponCreateService)
    .to(CouponCreateService)
    .inSingletonScope();
  container
    .bind<ICouponUpdateService>(TYPES.CouponUpdateService)
    .to(CouponUpdateService)
    .inSingletonScope();

  // Validators
  container
    .bind<ProductVariantUniquenessValidator>(
      TYPES.ProductVariantUniquenessValidator,
    )
    .to(ProductVariantUniquenessValidator)
    .inSingletonScope();
  // ID generator
  container
    .bind<IIdGenerator>(TYPES.IdGenerator)
    .to(MongoIdGenerator)
    .inSingletonScope();

  //token

  container
    .bind<ITokenService>(TYPES.ConfirmationTokenService)
    .to(TokenService)
    .inSingletonScope();
  // Email + tokens
  container.load(emailModule);
  container.load(usersModule);
  container.load(outboxModule);
}
