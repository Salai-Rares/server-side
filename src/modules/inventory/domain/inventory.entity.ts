import { ValidationError } from "@/shared/errors/ValidationError";
import {
  UpdateableInventoryFieldsTypes,
  UpdateableInventoryType,
  UpdateInventoryType,
} from "../schemas/inventory.dto";
import { InventoryProps } from "./inventory.types";
import { ChangeTracker } from "@/shared/services/change-tracker";

export class InventoryEntity implements InventoryProps {
  private changeTracker : ChangeTracker<InventoryEntity,UpdateableInventoryFieldsTypes> = new ChangeTracker()
  private readonly _id: string;
  private _stock: number; // Mutable
  private _inStock: boolean;
  private _warehouseLocation?: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;
  private _referenceRootId: string;
  private _referenceVariantId?: string | undefined;
  constructor(props: InventoryProps) {
    this._id = props.id;
    this._stock = props.stock;
    this._inStock = props.stock > 0;
    this._warehouseLocation = props.warehouseLocation;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._referenceRootId = props.referenceRootId;
    this._referenceVariantId = props.referenceVariantId;
    this.validate();
  }

  private validate() {
    if (!this._id) {
      throw ValidationError.domainRule(
        "id",
        "id_exists",
        "Inventory id missing",
        this._id
      );
    }

    if (!this.referenceRootId) {
      throw ValidationError.domainRule(
        "referenceRootId",
        "referenceRootId_exists",
        "Inventory must reference a product",
        this._id
      );
    }

    if (this.stock < 0) {
      throw ValidationError.domainRule(
        "stock",
        "stock_positive",
        "The stock must be positive",
        this._id
      );
    }

    if (this.stock > 0 && !this.inStock) {
      throw ValidationError.domainRule(
        "stock",
        "in_stock_positive",
        "InStock should be true when stock is greater than 0",
        this._id
      );
    }

    if (this.stock === 0 && this.inStock) {
      throw ValidationError.domainRule(
        "stock",
        "in_stock_false",
        "InStock should be false when stock is 0",
        this._id
      );
    }
  }

  public get referenceRootId() {
    return this._referenceRootId;
  }

  public get referenceVariantId() {
    return this._referenceVariantId;
  }
  public get stock() {
    return this._stock;
  }
  public get inStock() {
    return this._inStock;
  }

  public get id() {
    return this._id;
  }
  public get warehouseLocation() {
    return this._warehouseLocation;
  }
  public get createdAt(): Date | undefined {
    return this._createdAt;
  }
  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  public updateStock(stock: number) {
    if (stock < 0) {
      throw ValidationError.domainRule(
        "stock",
        "stock_positive",
        "The stock must be positive",
        this._id
      );
    }
    this._stock = stock;
    this._inStock = this._stock > 0;
    this.changeTracker.mark("stock")
    this.changeTracker.mark("inStock")
  }

  public updateWarehouseLocation(warehouseLocation: string) {
    this._warehouseLocation = warehouseLocation;
    this.changeTracker.mark("warehouseLocation")
    
  }

  public clearWarehouseLocation() {
    this._warehouseLocation = undefined;
    this.changeTracker.mark("warehouseLocation")
  }

  public updateInventory(data: UpdateableInventoryType) {
    if (data.stock !== undefined) {
      this.updateStock(data.stock);
    }
    if (data.warehouseLocation !== undefined) {
      if (data.warehouseLocation === null) {
        this.clearWarehouseLocation();
      } else {
        this.updateWarehouseLocation(data.warehouseLocation);
      }
    }
  }

  public toUpdateObject() {
    return this.changeTracker.toUpdate(this)
  }
}
