import { ValidationError } from "@/shared/errors/ValidationError";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}
export type UserStatusType = `${UserStatus}`;
/**
 * User Status Value Object with state machine logic.
 * Encapsulates user account lifecycle and valid state transitions.
 */

export class UserStatusVO {
  /**
   * Valid state transitions.
   * Defines which status can transition to which.
   */
  private static readonly transitions: Record<
    UserStatusType,
    UserStatusType[]
  > = {
    active: ["inactive", "suspended", "deleted"], // Can self-deactivate, be suspended, or deleted
    inactive: ["active", "deleted"], // Can reactivate or be permanently deleted
    suspended: ["active", "deleted"], // Admin can unsuspend or permanently delete
    deleted: [], // Terminal state - no transitions
  };
  /**
   * All valid statuses
   */
  private static readonly validStatuses: UserStatusType[] = [
    "active",
    "inactive",
    "suspended",
    "deleted",
  ];
  constructor(private readonly _value: UserStatusType) {
    this.validate();
  }
  private validate(): void {
    if (!UserStatusVO.validStatuses.includes(this._value)) {
      throw ValidationError.domainRule(
        "status",
        "invalid_value",
        "Invalid user status",
        {
          provided: this._value,
          allowed: UserStatusVO.validStatuses,
        }
      );
    }
  }

  // =====================
  // Factory Methods
  // =====================
  static active(): UserStatusVO {
    return new UserStatusVO("active");
  }

  static inactive(): UserStatusVO {
    return new UserStatusVO("inactive");
  }

  static suspended(): UserStatusVO {
    return new UserStatusVO("suspended");
  }

  static deleted(): UserStatusVO {
    return new UserStatusVO("deleted");
  }

  // =====================
  // Getter
  // =====================
  get value(): UserStatusType {
    return this._value;
  }

  // =====================
  // State Checking Methods
  // =====================
  isActive(): boolean {
    return this._value === "active";
  }

  isInactive(): boolean {
    return this._value === "inactive";
  }

  isSuspended(): boolean {
    return this._value === "suspended";
  }

  isDeleted(): boolean {
    return this._value === "deleted";
  }
  /**
   * Check if this is a terminal state (no more transitions possible)
   */
  isTerminal(): boolean {
    return this._value === "deleted";
  }

   // =====================
  // State Transition Logic
  // =====================

  /**
   * Check if transition to target status is allowed
   */
  canTransitionTo(target: UserStatusType): boolean {
    return UserStatusVO.transitions[this._value].includes(target);
  }

  /**
   * Transition to new status with validation
   */
  transitionTo(target: UserStatusType): UserStatusVO {
    if (!this.canTransitionTo(target)) {
      throw ValidationError.domainRule(
        "status_transition",
        "invalid_transition",
        `Cannot transition user status from ${this._value} to ${target}`,
        {
          from: this._value,
          to: target,
          allowedTransitions: UserStatusVO.transitions[this._value],
        }
      );
    }
    return new UserStatusVO(target);
  }

 /**
   * Get all valid transitions from current state
   */
  getAvailableTransitions(): UserStatusType[] {
    return [...UserStatusVO.transitions[this._value]];
  }

  
  // =====================
  // Convenience Transition Methods
  // =====================

  /**
   * Activate account (e.g., after user reactivates from inactive status)
   */
  activate(): UserStatusVO {
    return this.transitionTo("active");
  }

  /**
   * Deactivate account (user-initiated temporary deactivation)
   */
  deactivate(): UserStatusVO {
    return this.transitionTo("inactive");
  }

  /**
   * Suspend account (admin action for policy violations, fraud, etc.)
   */
  suspend(): UserStatusVO {
    return this.transitionTo("suspended");
  }

  /**
   * Unsuspend account (admin restores access)
   */
  unsuspend(): UserStatusVO {
    return this.transitionTo("active");
  }

  /**
   * Soft delete account (GDPR, permanent closure)
   */
  softDelete(): UserStatusVO {
    return this.transitionTo("deleted");
  }

  
  // =====================
  // Utility Methods
  // =====================

  equals(other: UserStatusVO): boolean {
    return this._value === other._value;
  }
}
