const ONE_HOUR_MS = 1000 * 60 * 60;
const ONE_DAY_MS = ONE_HOUR_MS * 24;

/**
 * Lifetime of a session cookie and its Redis entry. Anything scoped to "as long
 * as this browser can still identify itself" derives from this rather than
 * restating it — see the guest cart TTL in the cart model.
 */
export const SESSION_TTL_MS =
  process.env.NODE_ENV === "production" ? 7 * ONE_DAY_MS : 5 * ONE_HOUR_MS;
