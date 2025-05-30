type ProductStatusType = "draft" | "active" | "archived" | "deleted";

export class ProductStatus {
  private static readonly transitions: Record<ProductStatusType, ProductStatusType[]> = {
    draft: ["active"],
    active: ["archived", "deleted"],
    archived: ["active"],
    deleted: [], // terminal state
  };

   constructor(private readonly value: ProductStatusType) {
    this.validate();
   }

  private validate(): void {
  if (!(this.value in ProductStatus.transitions)) {
    throw new Error(`Invalid product status: ${this.value}`);
  }
}

  getValue(): ProductStatusType {
    return this.value;
  }

  canTransitionTo(target: ProductStatusType): boolean {
    return ProductStatus.transitions[this.value].includes(target);
  }

  transitionTo(target: ProductStatusType): ProductStatus {
    if (!this.canTransitionTo(target)) {
      throw new Error(`Cannot transition from ${this.value} to ${target}`);
    }
    return new ProductStatus(target);
  }

  equals(other: ProductStatus): boolean {
    return this.value === other.value;
  }

  isDeleted(): boolean {
    return this.value === "deleted";
  }

  isActive(): boolean {
    return this.value === "active";
  }
}