import { ProductProps } from "../../domain/product.types";
import { ProductDescriptionVO } from "../../domain/value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "../../domain/value-objects/description/short-description.value-object";
import { PriceVO } from "../../domain/value-objects/price.value-object";
import { SeoMetaVO } from "../../domain/value-objects/seo-meta.value-object";
import { ProductSkuVO } from "../../domain/value-objects/sku.value-object";
import { EntityStatusVO } from "@/core/domain/value-objects/status.value-objects";
import { ProductVariantEntity } from "../../domain/variant-product.entity";
import { CreateProductType } from "../../schemas/create-product.schema";

export class ProductDtoToEntityMapper {
  /*
    Map without id and variants, as id and variants will be proccesed inside the service.
    Also hasVariants is calculated inside the entity.
    Slug too.
    Images is also mapped in the service as it needs to have an id generated
    */
  static mapToEntity(
    dto: CreateProductType
  ): Omit<
    ProductProps,
    "id" | "variants" | "hasVariants" | "slug" | "images" | "discount"
  > {
    return {
      sku: new ProductSkuVO(dto.sku),

      description: dto.description
        ? new ProductDescriptionVO(dto.description)
        : undefined,
      shortDescription: dto.shortDescription
        ? new ShortProductDescriptionVO(dto.shortDescription)
        : undefined,
      productOptions: dto.productOptions
        ? new Map(Object.entries(dto.productOptions))
        : undefined,
      brand: dto.brand,
      categories: dto.categories,
      tags: dto.tags,
      price: dto.price
        ? new PriceVO({
            currency: dto.price.currency,
            amount: dto.price.amount,
          })
        : undefined,
      costPrice : dto.costPrice
        ? new PriceVO({
            currency: dto.costPrice.currency,
            amount: dto.costPrice.amount,
          })
        : undefined,
      vatRate : dto.vatRate,
      isFeatured: dto.isFeatured ?? false,
      status: EntityStatusVO.draft(),
      ratings: dto.ratings,
      reviewsCount: dto.reviewsCount,
      seo: dto.seo ? SeoMetaVO.fromDto(dto.seo) : undefined,
      attributes: dto.attributes,
      name: dto.name,
    };
  }
}
