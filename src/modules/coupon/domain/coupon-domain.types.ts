export interface CouponProps {
  id: string;
  code: string;
  discountId: string;
  createdBy: string;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
