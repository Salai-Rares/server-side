import { DiscountEntity } from "../../domain/discount.entity";

export interface IDiscountReadRepository {
  findAll(): Promise<DiscountEntity[]>;
  findAllActiveAutomatic(): Promise<DiscountEntity[]>;
  findById(id: string): Promise<DiscountEntity | null>;
}
