// import { Redis as RedisType } from "ioredis";
// import { AllUniqueKeyAndValuesFilters } from "../../types/product";
// import { CACHE_KEYS } from "../../constants";
// import {
//   IFilterCacheReader,
//   IFilterCacheSaver,
// } from "../../types";

// class AttributesKeysCache
//   implements  IFilterCacheReader, IFilterCacheSaver
// {
//   private redisClient: RedisType;
//   constructor(redisClient: RedisType) {
//     this.redisClient = redisClient;
//   }

//   existsFilters(filters: Record<string, unknown>): Promise<boolean> {
//     throw new Error("Method not implemented.");
//   }
  
//   public async saveFiltersToRedis(
//     productFilters: AllUniqueKeyAndValuesFilters
//   ) {
//     const redisKey = CACHE_KEYS.PRODUCT_UNIQUE_FILTERS;

//     // Convert the filter structure to a JSON string
//     const pipeline = this.redisClient.pipeline();

//     productFilters.forEach((filter) => {
//       pipeline.hset(redisKey, filter.key, JSON.stringify(filter.values)); // Store as JSON string
//     });

//     await pipeline.exec(); // Execute the pipeline in Redis
//     console.log("Filters saved to Redis as JSON!");
//   }

//   async handleProductAdded(data: any) {
//     /*
//       implement the product added function
//     }
//     */
//   }
// }
// export default AttributesKeysCache;
