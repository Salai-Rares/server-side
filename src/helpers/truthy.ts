export function isNonEmptyArray<T>(value: unknown): value is T[] {
    return Array.isArray(value) && value.length > 0;
  }
  
  //  Check if an object is non-empty (not {}, not null, not an array)
  export function isNonEmptyObject<T extends Record<string, any>>(value: unknown): value is T {
    return !!value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
  }
  
  //  Check if a value is a valid non-empty string
  export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
  }
  
  //  Check if a value is truthy (handles null, undefined, NaN, empty objects, and empty arrays)
  export function isTruthy<T>(value: T | null | undefined): value is T {
    if (Array.isArray(value)) return isNonEmptyArray(value);
    if (typeof value === "object" && value !== null) return isNonEmptyObject(value);
    if (typeof value === "string") return isNonEmptyString(value);
    return Boolean(value);
  }