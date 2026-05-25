import { injectable, inject } from "inversify";
import { ICache } from "../../core/application/ports/cache/IRedisCache";
import { Redis as RedisType } from "ioredis";
import { TYPES } from "@/shared/types";

@injectable()
export class RedisCache implements ICache {
  constructor(
    @inject(TYPES.RedisThirdParty) private readonly client: RedisType
  ) {}

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists > 0;
  }

  async hset<T>(key: string, field: string, value: T): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const result = await this.client.hget(key, field);
    return result ? JSON.parse(result) : null;
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(key);
    const result: Record<string, T> = {};
    for (const field of Object.keys(data)) {
      result[field] = JSON.parse(data[field]) as T;
    }
    return result;
  }

  async hmgetWithKeys<T>(
    key: string,
    fields: string[]
  ): Promise<Record<string, T | null>> {
    const values = await this.client.hmget(key, ...fields);

    return fields.reduce((acc, field, index) => {
      acc[field] = values[index] ? (JSON.parse(values[index]) as T) : null;
      return acc;
    }, {} as Record<string, T | null>);
  }
}
