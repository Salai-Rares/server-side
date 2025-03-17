import { CACHE_KEYS } from "../constants";
import RedisClient from "../db/redis/redisClient";

// const addMultipleKeyValuesHSet = async (
//   keyHset: string,
//   List: { key: string; value: string[] }[]
// ): Promise<void> => {
//   const redisClient = RedisClient.getInstance();
//   // Convert the filter structure to a JSON string
//   const pipeline = redisClient.pipeline();

//   List.forEach((filter) => {
//     pipeline.hset(keyHset, filter.key, JSON.stringify(filter.value)); // Store as JSON string
//   });

//   await pipeline.exec(); // Execute the pipeline in Redis
//   console.log("Filters saved to Redis as JSON!");
// };

// // const getMultipleKeyValuesHset = async(  keyHset: string) =>{
// //     const redisClient = RedisClient.getInstance();
// //    let values =  await redisClient.hgetall(keyHset);
   
// }
// export {addMultipleKeyValuesHSet,getMultipleKeyValuesHset };