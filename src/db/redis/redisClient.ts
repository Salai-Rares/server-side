import { inject, injectable } from "inversify";
import Redis, { Redis as RedisType } from "ioredis";
import { TYPES } from "../../types";


@injectable() // ✅ Now RedisClient can be injected via Inversify
export class RedisClient {


  constructor(@inject(TYPES.RedisThirdParty) private client:RedisType) {
    
    this.client.on("connect", () => {
      console.log("Connected to Redis");
    //   eventEmitter.emit("event1"); // ✅ Emits event when Redis is ready
    });

    this.client.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }

  // ✅ Public method to get the Redis client
  getClient(): RedisType {
    return this.client;
  }
}

export default RedisClient; 