import { IProductDocument } from "../types";
import { AllUniqueKeyAndValuesFilters } from "../types/product-query-filter.types";
import slugify from "slugify";
import { ValidationError } from "@/shared/errors/ValidationError";

export function validateAttributesSize(
  attributes: AllUniqueKeyAndValuesFilters
) {
  if (attributes.length > 10) {
    // Throw a ValidationError instead of plain Error
    throw ValidationError.domainRule(
      "attributes",
      "max_size",
      "Product cannot have more than 10 attributes",
      attributes.length
    );
  }
  return true; // Mongoose expects true for valid
}

