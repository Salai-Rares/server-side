export interface PasswordResetPrimitives {
  token: string;
  expiresAt: Date;
}

export class PasswordResetVO {
  private constructor(
    private readonly _token: string,
    private readonly _expiresAt: Date
  ) {}

  static create(token: string, expiresAt: Date): PasswordResetVO {
    return new PasswordResetVO(token, expiresAt);
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  isExpired(now: Date = new Date()): boolean {
    return this._expiresAt.getTime() <= now.getTime();
  }

  toPrimitives(): PasswordResetPrimitives {
    return { token: this._token, expiresAt: this._expiresAt };
  }

  static fromPrimitives(raw: PasswordResetPrimitives): PasswordResetVO {
    return new PasswordResetVO(raw.token, raw.expiresAt);
  }
}
