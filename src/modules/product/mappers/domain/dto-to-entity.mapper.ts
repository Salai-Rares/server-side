import { ProductProps } from "../../domain/product.types";
import { ProductDescriptionVO } from "../../domain/value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "../../domain/value-objects/description/short-description.value-object";
import { DiscountVO } from "../../domain/value-objects/discount.value-object";
import { PriceVO } from "../../domain/value-objects/price.value-object";
import { SeoMetaVO } from "../../domain/value-objects/seo-meta.value-object";
import { ProductSkuVO } from "../../domain/value-objects/sku.value-object";
import { ProductStatus } from "../../domain/value-objects/status.value-object";
import { ProductVariantEntity } from "../../domain/variant-product.entity";
import { CreateProductDto } from "../../schemas";

export class ProductDtoToEntityMapper {
  /*
    Map without id and variants, as id and variants will be proccesed inside the service.
    */
  static mapToEntity(
    dto: CreateProductDto
  ): Omit<ProductProps, "id" | "variants" | "hasVariants" | "slug"> {
    return {
      sku: new ProductSkuVO(dto.sku),
      
      description: new ProductDescriptionVO(dto.description),
      shortDescription: dto.shortDescription
        ? new ShortProductDescriptionVO(dto.shortDescription)
        : undefined,
      brand: dto.brand,
      categories: dto.categories,
      tags: dto.tags,
      images: dto.images,
      price: new PriceVO({
        currency: dto.price.currency,
        amount: dto.price.amount,
      }),
      discount: dto.discount
        ? new DiscountVO({
            type: dto.discount.type,
            value: dto.discount.value,
            validUntil: dto.discount.validUntil,
          })
        : undefined,

      isFeatured: dto.isFeatured ?? false,
      status: new ProductStatus(dto.status ?? "draft"),
      ratings: dto.ratings,
      reviewsCount: dto.reviewsCount,
      seo: dto.seo ? new SeoMetaVO(dto.seo) : undefined,
      attributes: dto.attributes,
      name:dto.name
    };
  }
}
