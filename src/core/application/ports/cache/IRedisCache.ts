export interface ICache {
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  hset<T>(key: string, field: string, value: T): Promise<void>;
  hget<T>(key: string, field: string): Promise<T | null>;
  hgetall<T>(key: string): Promise<Record<string, T>>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
