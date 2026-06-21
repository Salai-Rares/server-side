import { ClientSession } from "mongoose";
import { DiscountEntity } from "../../domain/discount.entity";

export interface IncrementUsageResult {
  success: boolean;
  limitReached: boolean;
}

export interface IDiscountUpdateRepository {
  atomicIncrementUsage(id: string): Promise<IncrementUsageResult>;
  save(entity: DiscountEntity, options?: { session?: ClientSession }): Promise<DiscountEntity>;
}
