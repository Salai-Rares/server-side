import { ClientSession } from "mongoose";
import { DiscountEntity } from "../../domain/discount.entity";

export interface IDiscountCreateRepository {
    saveDiscount(discountEntity: DiscountEntity,options?: { session?: ClientSession }):Promise<DiscountEntity>
}