import { inject } from "inversify";
import { TYPES } from "@/shared/types";
import { CartEntity } from "../domain/cart.entity";
import { CartOwner } from "../domain/cart-domain.types";
import { ICartRepository } from "../repositories/types/cart.repository.types";
import { IProductRepositoryRead } from "@/modules/product/types/read/product-read.repository.types";
import { IInventoryRepositoryRead } from "@/modules/inventory/types/read/inventory-read.repository.types";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
import { ICartService } from "./types/cart.service.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class CartService implements ICartService {
  constructor(
    @inject(TYPES.CartRepository)
    private cartRepo: ICartRepository,
    @inject(TYPES.ProductReadRepository)
    private productRepo: IProductRepositoryRead,
    @inject(TYPES.InventoryRepositoryRead)
    private inventoryRepo: IInventoryRepositoryRead,
    @inject(TYPES.IdGenerator)
    private idGenerator: IIdGenerator
  ) {}

  /** Read-only: a shopper who has never added anything simply has no cart. */
  async getCart(owner: CartOwner): Promise<CartEntity | null> {
    return this.cartRepo.findByOwner(owner);
  }

  async addItem(
    owner: CartOwner,
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<CartEntity> {
    const product = await this.productRepo.findProductById(productId);
    if (!product) throw ApiError.notFound("Product not found");

    if (variantId) {
      product.getVariantById(variantId);
    }

    const inventory = await this.inventoryRepo.findInventoryByReferences(productId, variantId);
    if (!inventory || !inventory.inStock) {
      throw ApiError.badRequest("Product is out of stock");
    }

    const cart = await this.getOrCreateCart(owner);
    cart.addItem(productId, quantity, variantId);
    return this.cartRepo.save(cart);
  }

  async removeItem(
    owner: CartOwner,
    productId: string,
    variantId?: string
  ): Promise<CartEntity> {
    const cart = await this.requireCart(owner);
    cart.removeItem(productId, variantId);
    return this.cartRepo.save(cart);
  }

  async updateQuantity(
    owner: CartOwner,
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<CartEntity> {
    const cart = await this.requireCart(owner);
    cart.updateQuantity(productId, quantity, variantId);
    return this.cartRepo.save(cart);
  }

  /** Idempotent: clearing a cart that does not exist is already satisfied. */
  async clearCart(owner: CartOwner): Promise<CartEntity | null> {
    const cart = await this.cartRepo.findByOwner(owner);
    if (!cart) return null;
    cart.clear();
    return this.cartRepo.save(cart);
  }

  async mergeGuestCart(userId: string, guestId: string): Promise<CartEntity> {
    const guestCart = await this.cartRepo.findByOwner({ guestId });
    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart({ userId });
    }

    const userCart = await this.getOrCreateCart({ userId });
    userCart.mergeItems(guestCart.items);
    await this.cartRepo.delete(guestCart.id);
    return this.cartRepo.save(userCart);
  }

  /** Only for operations where a cart coming into existence is meaningful. */
  private getOrCreateCart(owner: CartOwner): Promise<CartEntity> {
    return this.cartRepo.findOrCreate(owner, this.idGenerator.generate());
  }

  private async requireCart(owner: CartOwner): Promise<CartEntity> {
    const cart = await this.cartRepo.findByOwner(owner);
    if (!cart) throw ApiError.notFound("Cart not found");
    return cart;
  }
}
