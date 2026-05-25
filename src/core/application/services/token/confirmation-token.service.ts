import { inject, injectable } from "inversify";
import { ITokenService } from "../../ports/email/email-token-service.interface";
import { ConfirmationTokenType } from "../../ports/token/confirmation-token-kind.enum";
import { TYPES } from "@/shared/types";
import { ICache } from "../../ports/cache/IRedisCache";

@injectable()
export class TokenService
  implements ITokenService
{
  private readonly TTL_SECONDS = 60 * 60; // 1h
  constructor(@inject(TYPES.RedisCache) private readonly cache: ICache) {}

  private buildKey(type: ConfirmationTokenType, token: string): string {
    return `${type}:${token}`;
  }

  async generateToken(
    subject: string,
    type: ConfirmationTokenType
  ): Promise<string> {
    const token = crypto.randomUUID();
    const key = this.buildKey(type, token);

    await this.cache.set(key, { subject }, this.TTL_SECONDS);

    return token;
  }

  async verifyAndConsumeToken(
    token: string,
    type: ConfirmationTokenType
  ): Promise<{ subject: string } | null> {
    const key = this.buildKey(type, token);

    const data = await this.cache.get<{ subject: string }>(key);
    if (!data) return null;

    // optional: one-time token
    await this.cache.del(key);

    return data;
  }
}

