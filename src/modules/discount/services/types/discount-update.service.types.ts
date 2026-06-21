import { ClientSession } from "mongoose";
import { DiscountEntity } from "../../domain/discount.entity";

export interface IDiscountUpdateService {
  atomicIncrementUsage(id: string): Promise<boolean>;
  activate(id: string): Promise<DiscountEntity>;
  deactivate(id: string): Promise<DiscountEntity>;
  save(entity: DiscountEntity, options?: { session?: ClientSession }): Promise<DiscountEntity>;
}
