import { IRedisCache } from "../types/redis-cache.types";
import { Redis as RedisType } from "ioredis";
export abstract class RedisCache implements IRedisCache {
  protected client: RedisType;
  private prefix: string;

  constructor(prefix: string, client: RedisType) {
    this.client = client;
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.client.set(fullKey, JSON.stringify(value), "EX", ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const result = await this.client.get(fullKey);
    return result ? JSON.parse(result) : null;
  }
  async del(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.client.del(fullKey);
  }
  async exists(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists > 0; // EXISTS returns 1 if the key exists, 0 otherwise
  }


  async hset<T>(key: string, field: string, value: T): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.client.hset(fullKey, field, JSON.stringify(value));
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const result = await this.client.hget(fullKey, field);
    return result ? JSON.parse(result) : null;
  }
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const fullKey = this.getFullKey(key);
    const data = await this.client.hgetall(fullKey);
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
