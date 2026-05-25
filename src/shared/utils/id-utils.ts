import { Types } from 'mongoose';

/**
 * Validates MongoDB ObjectIDs using Mongoose's implementation
 * (with the safety of TypeScript)
 */
export function isValidObjectId(id: string | Types.ObjectId): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Safely converts to ObjectId
 * @throws Error if invalid format
 */
export function toObjectId(id: string): Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId format: ${id}`);
  }
  return new Types.ObjectId(id);
}

/**
 * Safely converts to ObjectId (returns null instead of throwing)
 */
export function tryToObjectId(id: string): Types.ObjectId | null {
  return isValidObjectId(id) ? new Types.ObjectId(id) : null;
}
