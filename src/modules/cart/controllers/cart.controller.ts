import { Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpPost, httpGet, httpPatch, httpDelete, BaseHttpController } from "inversify-express-utils";
import { TYPES } from "@/shared/types";
import { CartEntity } from "../domain/cart.entity";
import { CartOwner } from "../domain/cart-domain.types";
import { ICartService } from "../services/types/cart.service.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { z } from "zod";

const AddItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
});

const UpdateQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1),
  variantId: z.string().optional(),
});

/**
 * Keeps one response shape whether or not a cart document exists, so clients
 * never have to branch on "never shopped" vs "cart is empty".
 */
function toCartResponse(cart: CartEntity | null) {
  if (!cart) {
    return { id: null, items: [], itemCount: 0, totalQuantity: 0 };
  }
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      addedAt: item.addedAt,
    })),
    itemCount: cart.itemCount,
    totalQuantity: cart.totalQuantity,
  };
}

@controller("/api/v1/cart")
export class CartController extends BaseHttpController {
  constructor(
    @inject(TYPES.CartService)
    private cartService: ICartService
  ) {
    super();
  }

  private getOwner(req: Request): CartOwner {
    if (req.session.userId) return { userId: req.session.userId };
    if (req.session.guestId) return { guestId: req.session.guestId };
    throw ApiError.badRequest("No active session");
  }

  @httpGet("/")
  async getCart(req: Request, res: Response): Promise<void> {
    const cart = await this.cartService.getCart(this.getOwner(req));
    res.status(200).json({ status: "success", data: { cart: toCartResponse(cart) } });
  }

  @httpPost("/items")
  async addItem(req: Request, res: Response): Promise<void> {
    const { productId, variantId, quantity } = AddItemSchema.parse(req.body);
    const cart = await this.cartService.addItem(this.getOwner(req), productId, quantity, variantId);
    res.status(200).json({ status: "success", data: { cart: toCartResponse(cart) } });
  }

  @httpPatch("/items/:productId")
  async updateQuantity(req: Request, res: Response): Promise<void> {
    const { quantity, variantId } = UpdateQuantitySchema.parse(req.body);
    const cart = await this.cartService.updateQuantity(this.getOwner(req), req.params.productId, quantity, variantId);
    res.status(200).json({ status: "success", data: { cart: toCartResponse(cart) } });
  }

  @httpDelete("/items/:productId")
  async removeItem(req: Request, res: Response): Promise<void> {
    const variantId = req.query.variantId as string | undefined;
    const cart = await this.cartService.removeItem(this.getOwner(req), req.params.productId, variantId);
    res.status(200).json({ status: "success", data: { cart: toCartResponse(cart) } });
  }

  @httpDelete("/")
  async clearCart(req: Request, res: Response): Promise<void> {
    const cart = await this.cartService.clearCart(this.getOwner(req));
    res.status(200).json({ status: "success", data: { cart: toCartResponse(cart) } });
  }
}
