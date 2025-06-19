
import { CreateProductType } from "@/modules/product/schemas";
import { faker } from "@faker-js/faker";
import { Types } from "mongoose";

export function makePlainProductDto(overrides: Partial<CreateProductType> = {}): CreateProductType {
  return {
    sku: 'TOOL-CHAIN-X45',
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    shortDescription: faker.commerce.productDescription(),
    brand: new Types.ObjectId().toString(),
    categories: [new Types.ObjectId().toString()],
    tags: [faker.commerce.productAdjective()],
    images: [
      {
        url: faker.image.url(),
        alt: faker.commerce.productAdjective(),
        isPrimary: true,
      },
    ],
    price: {
      currency: "LEU",
      amount: faker.number.int({ min: 1, max: 100 }),
    },
    isFeatured: false,
    status: "draft",
    ratings: {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    reviewsCount: 0,
    seo: {
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      keywords: faker.lorem.words(5).split(" "),
      cannonicalUrl: faker.internet.url(),
    },
    attributes: [],
    ...overrides,
  };
}

export function makeDtoWithRootInventory(): CreateProductType {
  return makePlainProductDto({
    inventory: {
      stock: faker.number.int({ min: 1, max: 50 }),
      warehouseLocation: faker.location.city(),
    },
    variants: undefined, // ensure no conflict
  });
}

export function makeProductWithVariants(): CreateProductType {
  return makePlainProductDto({
    variants: [
      {
        sku: 'TOOL-CHAIN-X45',
        productOptions: { color: "red", size: "L" },
        price: {
          currency: "LEU",
          amount: 50,
        },
        inventory: {
          stock: 5,
          warehouseLocation: "Warehouse X",
        },
        images: [],
      },
       {
        sku: 'TOOL-CHAIN-X46',
        productOptions: { color: "blue", size: "L" },
        price: {
          currency: "LEU",
          amount: 520,
        },
        inventory: {
          stock: 5,
          warehouseLocation: "Warehouse X",
        },
        images: [],
      },
    ],
  });
}

export function makeProductWithRootInventoryAndVariants(): CreateProductType {
  return makePlainProductDto({
    inventory: {
      stock: faker.number.int({ min: 1, max: 100 }),
      warehouseLocation: faker.location.city(),
    },
    variants: [
      {
        sku: faker.string.alphanumeric(8),
        productOptions: { size: "L", color: "green" },
        price: {
          currency: "LEU",
          amount: faker.number.int({ min: 1, max: 100 }),
        },
        inventory: {
          stock: faker.number.int({ min: 1, max: 100 }),
          warehouseLocation: faker.location.city(),
        },
        images: [],
      },
    ],
  });
}