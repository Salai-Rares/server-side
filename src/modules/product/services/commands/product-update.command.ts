import {
  InventoryCreateType,
  InventoryOperationType,
} from "@/modules/inventory/schemas/inventory.dto";
import {
  ProductDomainUpdateType,
  ProductImageType,
  VariantCreateType,
} from "../../schemas";
import {
  ImageOperationCommandType,
  VariantCreateCommandType,
  VariantOperationsCommandType,
  VariantUpdateCommandType,
} from "../../schemas/update/update-product.command.schema";

export interface ProductUpdateCommand {
  productId: string;
  productDomain?: ProductDomainUpdateType;
  imageOperations?: ImageOperationCommandType;
  inventory?: InventoryOperationType;
  variantOperations?: VariantOperationsCommandType;
  reason?: string;
}
