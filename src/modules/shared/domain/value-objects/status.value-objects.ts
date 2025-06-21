import { ValidationError } from "@/shared/errors/ValidationError";


export type EntityStatusType = "draft" | "active" | "archived" | "deleted";

export class EntityStatusVO {
  private static readonly transitions: Record<
    EntityStatusType, EntityStatusType[]
  > = {
      draft: ["active"],
      active: ["archived", "deleted"],
      archived: ["active"],
      deleted: [], // terminal state
    };

  // Define valid statuses for validation
  private static readonly validStatuses: EntityStatusType[] = [
    "draft",
    "active",
    "archived",
    "deleted",
  ];

  constructor(private readonly _value: EntityStatusType) {
    this.validate();
  }

  private validate(): void {
    if (!EntityStatusVO.validStatuses.includes(this._value)) {
      throw ValidationError.domainRule(
        "status",
        "invalid_value",
        "Invalid product status",
        {
          provided: this._value,
          allowed: EntityStatusVO.validStatuses,
        }
      );
    }
  }

  // Factory methods for explicit creation
  static draft(): EntityStatusVO {
    return new EntityStatusVO("draft");
  }

  static active(): EntityStatusVO {
    return new EntityStatusVO("active");
  }

  static archived(): EntityStatusVO {
    return new EntityStatusVO("archived");
  }

  static deleted(): EntityStatusVO {
    return new EntityStatusVO("deleted");
  }

  // Getter methods
  get value(): EntityStatusType {
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
  canTransitionTo(target: EntityStatusType): boolean {
    return EntityStatusVO.transitions[this._value].includes(target);
  }

  transitionTo(target: EntityStatusType): EntityStatusVO {
    if (!this.canTransitionTo(target)) {
      throw ValidationError.domainRule(
        "status_transition",
        "invalid_transition",
        `Cannot transition product status from ${this._value} to ${target}`,
        {
          from: this._value,
          to: target,
          allowedTransitions: EntityStatusVO.transitions[this._value],
        }
      );
    }
    return new EntityStatusVO(target);
  }

  // Get all possible transitions from current state
  getAvailableTransitions(): EntityStatusType[] {
    return [...EntityStatusVO.transitions[this._value]];
  }

  // Convenience transition methods
  activate(): EntityStatusVO {
    return this.transitionTo("active");
  }

  archive(): EntityStatusVO {
    return this.transitionTo("archived");
  }

  delete(): EntityStatusVO {
    return this.transitionTo("deleted");
  }

  // Utility methods
  equals(other: EntityStatusVO): boolean {
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
  // Static helper methods
  static getAllStatuses(): EntityStatusType[] {
    return [...EntityStatusVO.validStatuses];
  }

  static getPublicStatuses(): EntityStatusType[] {
    return ["active"];
  }

  static getManageableStatuses(): EntityStatusType[] {
    return ["draft", "active", "archived"];
  }

  // Validation helper for external use
  static isValidStatus(status: string): status is EntityStatusType {
    return EntityStatusVO.validStatuses.includes(status as EntityStatusType);
  }

  // Create from string with validation
  static fromString(status: string): EntityStatusVO {
    if (!EntityStatusVO.isValidStatus(status)) {
      throw ValidationError.domainRule(
        "status",
        "invalid_format",
        "Invalid product status format",
        {
          provided: status,
          allowed: EntityStatusVO.validStatuses,
        }
      );
    }
    return new EntityStatusVO(status);
  }
}
