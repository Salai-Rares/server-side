import { InventoryProps } from "./inventory.types";

export class InventoryEntity implements InventoryProps {
  private readonly _id: string;
  private readonly _referenceType: "product" | "variant";
  private readonly _referenceId: string; // Points to Product.id or ProductVariant.id
  private _stock: number; // Mutable
  private _inStock: boolean;
  private _warehouseLocation?: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;
  constructor(props: InventoryProps) {
    this._id = props.id;
    this._referenceId = props.referenceId;
    this._referenceType = props.referenceType;
    this._stock = props.stock;
    this._inStock = props.inStock;
    this._warehouseLocation = props.warehouseLocation;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    if (!this.id) {
      throw new Error("Inventory must have a id");
    }
    if (!["product", "variant"].includes(this.referenceType))
      throw new Error(
        "Invenotry must reference either a product or a variant of a product"
      );
    if (!this.referenceId)
      throw new Error("Inventory must reference a product or variant");
    if (this.stock < 0) throw new Error("Quantity cannot be negative");
    if (this.stock > 0 && !this.inStock)
      throw new Error("inStock should be true when stock is greater than 0");
    if (this.stock === 0 && this.inStock)
      throw new Error("inStock should be false when stock is zero");
  }

  public get referenceId() {
    return this._referenceId;
  }
  public get stock() {
    return this._stock;
  }
  public get inStock() {
    return this._inStock;
  }
  public set stock(value: number) {
    if (value < 0) throw new Error("Quantity cannot be negative");
    this._stock = value;
  }
  public get id() {
    return this._id;
  }
  public get referenceType() {
    return this._referenceType;
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
}
