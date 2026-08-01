/**
 * Declared by the users module: when a guest authenticates, whatever they
 * accumulated under their guest session should follow them into their account.
 *
 * Users deliberately does not know what that is — cart supplies an
 * implementation, so the dependency runs cart -> users rather than the reverse.
 *
 * Implementations must not throw. A failed handover is a degraded experience,
 * never a failed login.
 */
export interface IGuestSessionHandover {
  handOver(userId: string, guestId: string): Promise<void>;
}
