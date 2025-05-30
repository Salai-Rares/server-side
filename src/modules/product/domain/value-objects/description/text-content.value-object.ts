 export abstract class TextContent {
  constructor(protected readonly value: string) {
    this.validate(value);
  }

  protected abstract getMinLength(): number;
  protected abstract getMaxLength(): number;

  protected validate(value: string): void {
    if (value.length < this.getMinLength()) {
      throw new Error(`Text too short (min ${this.getMinLength()} chars)`);
    }
    if (value.length > this.getMaxLength()) {
      throw new Error(`Text too long (max ${this.getMaxLength()} chars)`);
    }
  }
    toString(): string {
    return this.value;
  }
}
