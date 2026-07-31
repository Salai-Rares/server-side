import { CartProps, CartItemProps } from "./cart-domain.types";
import { ValidationError } from "@/shared/errors/ValidationError";

const MAX_CART_ITEMS = 50;

export class CartEntity {
  private readonly _id: string;
  private readonly _userId?: string;
  private readonly _guestId?: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;
  private _items: CartItemProps[];

  constructor(props: CartProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._guestId = props.guestId;
    this._items = props.items;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this.validate();
  }

  private validate() {
    if (!this._id) {
      throw ValidationError.domainRule("id", "id_required", "Cart id missing", this._id);
    }
    if (!this._userId && !this._guestId) {
      throw ValidationError.domainRule("owner", "owner_required", "Cart must belong to a user or guest", this._id);
    }
    if (this._userId && this._guestId) {
      throw ValidationError.domainRule("owner", "owner_exclusive", "Cart cannot belong to both a user and a guest", this._id);
    }
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw ValidationError.domainRule("quantity", "quantity_positive_integer", "Quantity must be a positive integer", this._id);
    }
  }

  public get id() { return this._id; }
  public get userId() { return this._userId; }
  public get guestId() { return this._guestId; }
  public get createdAt() { return this._createdAt; }
  public get updatedAt() { return this._updatedAt; }
  public get items(): CartItemProps[] { return [...this._items]; }
  public get itemCount() { return this._items.length; }
  public get totalQuantity() { return this._items.reduce((s, i) => s + i.quantity, 0); }

  private itemKey(productId: string, variantId?: string): string {
    return variantId ?? productId;
  }

  public addItem(productId: string, quantity: number, variantId?: string): void {
    this.validateQuantity(quantity);
    const key = this.itemKey(productId, variantId);
    const existing = this._items.find((i) => this.itemKey(i.productId, i.variantId) === key);

    if (existing) {
      existing.quantity += quantity;
      return;
    }

    if (this._items.length >= MAX_CART_ITEMS) {
      throw ValidationError.domainRule("items", "max_items", `Cart cannot exceed ${MAX_CART_ITEMS} items`, this._id);
    }
    this._items.push({ productId, variantId, quantity, addedAt: new Date() });
  }

  public removeItem(productId: string, variantId?: string): void {
    const key = this.itemKey(productId, variantId);
    const idx = this._items.findIndex((i) => this.itemKey(i.productId, i.variantId) === key);
    if (idx === -1) {
      throw ValidationError.domainRule("items", "item_not_found", "Item not in cart", this._id);
    }
    this._items.splice(idx, 1);
  }

  public updateQuantity(productId: string, quantity: number, variantId?: string): void {
    this.validateQuantity(quantity);
    const key = this.itemKey(productId, variantId);
    const existing = this._items.find((i) => this.itemKey(i.productId, i.variantId) === key);
    if (!existing) {
      throw ValidationError.domainRule("items", "item_not_found", "Item not in cart", this._id);
    }
    existing.quantity = quantity;
  }

  public mergeItems(incomingItems: CartItemProps[]): void {
    for (const incoming of incomingItems) {
      const key = this.itemKey(incoming.productId, incoming.variantId);
      const existing = this._items.find((i) => this.itemKey(i.productId, i.variantId) === key);

      if (existing) {
        existing.quantity = incoming.quantity;
      } else {
        if (this._items.length >= MAX_CART_ITEMS) continue;
        this._items.push({ ...incoming });
      }
    }
  }

  public clear(): void {
    this._items = [];
  }
}
