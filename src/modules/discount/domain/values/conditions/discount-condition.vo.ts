export abstract class DiscountConditionVO {
  constructor(
    public readonly type: string,
    public readonly operator: string
  ) {}

  abstract readonly value: unknown;

  abstract validate(): void;
}