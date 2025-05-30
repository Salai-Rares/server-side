export class ProductSkuVO {
    private readonly _value: string;
  
    constructor(sku: string) {
      if (!/^[A-Z]{2,4}-[A-Z0-9]{2,10}(-[A-Z0-9]{2,10}){0,2}$/.test(sku)) {
        throw new Error(
          "SKU must follow: {CATEGORY}-{TYPE}-{ID}[-VARIANT] (e.g., TOOL-CHAIN-X20)"
        );
      }
      this._value = sku;
    }
  
    // Example: Extract category
    get category(): string {
      return this._value.split('-')[0];
    }
    get value() : string{
        return this._value;
    }
  }