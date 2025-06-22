import { z } from "zod";
import { UpdateProductRequestSchema } from "@/modules/product/schemas/update/update-product.schema";

// ===================
// UNIT TESTS FOR SCHEMA
// ===================

describe("UpdateProductRequestSchema", () => {
  it("fails when no update fields are provided", () => {
    const input = {};
    const result = UpdateProductRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least one field must be provided/i
      );
    }
  });

  it("fails when uploadedMap is required but missing", () => {
    const input = {
      imageOperations: { add: [{ tempId: "abc" }] },
    };
    const result = UpdateProductRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("fails when uploadedMap has unexpected values", () => {
    const input = {
      imageOperations: { add: [{ tempId: "abc" }] },
      uploadedMap: {},
    };
    const result = UpdateProductRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("passes with valid root inventory update only", () => {
    const input = {
      inventory: { update: { id: "123", stock: 5 } },
    };
    const result = UpdateProductRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("fails if root inventory and variant operations both exist", () => {
    const input = {
      inventory: { create: { stock: 10 } },
      variantOperations: { add: [{ id: "v1", inventory: { stock: 5 } }] },
    };
    const result = UpdateProductRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("passes with valid variant operations and no inventory root", () => {
    const input = {
      variantOperations: {
        add: [
          {
            sku:"TEST-XC-2",
            productOptions: { size: "M" },
            inventory: { stock: 5 },
          },
        ],
      },
    };
    const result = UpdateProductRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("fails if uploadedMap has extra or missing entries", () => {
    const input = {
      imageOperations: { add: [{ tempId: "img1" }] },
      uploadedMap: { img2: 1 },
    };
    const result = UpdateProductRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});