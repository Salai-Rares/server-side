import { ValidationError } from "@/shared/errors/ValidationError";

export type ProductStatusType = "draft" | "active" | "archived" | "deleted";

export class ProductStatus {
  private static readonly transitions: Record<ProductStatusType, ProductStatusType[]> = {
    draft: ["active"],
    active: ["archived", "deleted"],
    archived: ["active"],
    deleted: [], // terminal state
  };

  // Define valid statuses for validation
  private static readonly validStatuses: ProductStatusType[] = ["draft", "active", "archived", "deleted"];

  constructor(private readonly _value: ProductStatusType) {
    this.validate();
  }

  private validate(): void {
    if (!ProductStatus.validStatuses.includes(this._value)) {
      throw ValidationError.domainRule(
        'status',
        'invalid_value',
        'Invalid product status',
        { 
          provided: this._value, 
          allowed: ProductStatus.validStatuses 
        }
      );
    }
  }

  // Factory methods for explicit creation
  static draft(): ProductStatus {
    return new ProductStatus("draft");
  }

  static active(): ProductStatus {
    return new ProductStatus("active");
  }

  static archived(): ProductStatus {
    return new ProductStatus("archived");
  }

  static deleted(): ProductStatus {
    return new ProductStatus("deleted");
  }

  // Getter methods
  get value(): ProductStatusType {
    return this._value;
  }

  // State checking methods
  isDraft(): boolean {
    return this._value === "draft";
  }

  isActive(): boolean {
    return this._value === "active";
  }

  isArchived(): boolean {
    return this._value === "archived";
  }

  isDeleted(): boolean {
    return this._value === "deleted";
  }

  isPublished(): boolean {
    return this._value === "active";
  }

  isTerminal(): boolean {
    return this._value === "deleted";
  }

  // Check if status allows certain operations
  canBeModified(): boolean {
    return !this.isDeleted();
  }

  canBePublished(): boolean {
    return this.isDraft();
  }

  canBeUnpublished(): boolean {
    return this.isActive();
  }

  // Transition logic
  canTransitionTo(target: ProductStatusType): boolean {
    return ProductStatus.transitions[this._value].includes(target);
  }

  transitionTo(target: ProductStatusType): ProductStatus {
    if (!this.canTransitionTo(target)) {
      throw ValidationError.domainRule(
        'status_transition',
        'invalid_transition',
        `Cannot transition product status from ${this._value} to ${target}`,
        { 
          from: this._value, 
          to: target, 
          allowedTransitions: ProductStatus.transitions[this._value] 
        }
      );
    }
    return new ProductStatus(target);
  }

  // Get all possible transitions from current state
  getAvailableTransitions(): ProductStatusType[] {
    return [...ProductStatus.transitions[this._value]];
  }

  // Convenience transition methods
  activate(): ProductStatus {
    return this.transitionTo("active");
  }

  archive(): ProductStatus {
    return this.transitionTo("archived");
  }

  delete(): ProductStatus {
    return this.transitionTo("deleted");
  }

  // Utility methods
  equals(other: ProductStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }

  // Business logic helpers
  requiresApproval(): boolean {
    return this.isDraft();
  }

  isVisibleToCustomers(): boolean {
    return this.isActive();
  }

  canHaveInventory(): boolean {
    return this.isActive() || this.isDraft();
  }

  // Static helper methods
  static getAllStatuses(): ProductStatusType[] {
    return [...ProductStatus.validStatuses];
  }

  static getPublicStatuses(): ProductStatusType[] {
    return ["active"];
  }

  static getManageableStatuses(): ProductStatusType[] {
    return ["draft", "active", "archived"];
  }

  // Validation helper for external use
  static isValidStatus(status: string): status is ProductStatusType {
    return ProductStatus.validStatuses.includes(status as ProductStatusType);
  }

  // Create from string with validation
  static fromString(status: string): ProductStatus {
    if (!ProductStatus.isValidStatus(status)) {
      throw ValidationError.domainRule(
        'status',
        'invalid_format',
        'Invalid product status format',
        { 
          provided: status, 
          allowed: ProductStatus.validStatuses 
        }
      );
    }
    return new ProductStatus(status);
  }
}