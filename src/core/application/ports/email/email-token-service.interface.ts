import { ConfirmationTokenType } from "../token/confirmation-token-kind.enum";

export interface ITokenService {
  generateToken(subject: string, type: ConfirmationTokenType, ttlSeconds?: number): Promise<string>;
  verifyAndConsumeToken(
    token: string,
    type: ConfirmationTokenType
  ): Promise<{ subject: string } | null>;
}
