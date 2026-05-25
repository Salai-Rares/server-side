export interface TermsAcceptancePrimitives {
  accepted: boolean;
  version: string;
  acceptedAt: Date;
}

export class TermsAcceptanceVO {
  private constructor(
    private readonly _accepted: boolean,
    private readonly _version: string,
    private readonly _acceptedAt: Date
  ) {}

  static accept(version: string): TermsAcceptanceVO {
    return new TermsAcceptanceVO(true, version, new Date());
  }

  static fromPersistence(primitives: TermsAcceptancePrimitives): TermsAcceptanceVO {
    return new TermsAcceptanceVO(primitives.accepted, primitives.version, primitives.acceptedAt);
  }

  get accepted() { return this._accepted; }
  get version() { return this._version; }
  get acceptedAt() { return this._acceptedAt; }

  toPrimitives(): TermsAcceptancePrimitives {
    return {
      accepted: this._accepted,
      version: this._version,
      acceptedAt: this._acceptedAt,
    };
  }
}
