import { mock, when, instance, verify, anything, reset } from "ts-mockito";
import { IInventoryRepositoryWrite } from "../../modules/inventory/types/create/inventory-create.repository.types";

import { ProductCreateUseCase } from "@/modules/product/services/product-create.service";
import { IProductRepositoryWrite } from "@/modules/product/types/create/product-write.repository.types";
import {
  makeDtoWithRootInventory,
  makeProductWithRootInventoryAndVariants,
  makeProductWithVariants,
} from "@/tests/factories/product.factory";
import {MongoServerError} from "mongodb"

import { ILogger } from "@/core/logger/logger.interface";
import { CreateProductType } from "@/modules/product/schemas";
import { IInventoryServiceCreate } from "@/modules/inventory/types/create/inventory-create.service.types";
describe("ProductCreateUseCase - Unit Tests", () => {
  const productRepo = mock<IProductRepositoryWrite>();
  const inventoryServiceWrite = mock<IInventoryServiceCreate>();
  const loggerMock = mock<ILogger>();
  let useCase: ProductCreateUseCase;

  beforeEach(() => {
    reset(productRepo);
    reset(inventoryServiceWrite);
    useCase = new ProductCreateUseCase(
      instance(productRepo),
      instance(inventoryServiceWrite),
      instance(loggerMock)
    );
  });
  it("throws if product has both root inventory and variants", async () => {
    const dto: CreateProductType = makeProductWithRootInventoryAndVariants();
    console.log("Test input DTO:", JSON.stringify(dto, null, 2));
    await expect(useCase.createProductWithInventories(dto)).rejects.toThrow(
      "Root product cannot have both variants and inventory"
    );
  });

  it("calls saveProduct and saveInventory for non-variant product", async () => {
    const dto: CreateProductType = makeDtoWithRootInventory();

    when(productRepo.saveProduct(anything())).thenResolve(expect.anything());

    when(inventoryServiceWrite.saveInventory(anything())).thenResolve(
      expect.anything()
    );

    await useCase.createProductWithInventories(dto);

    verify(productRepo.saveProduct(anything(), anything())).once();
    verify(inventoryServiceWrite.saveInventory(anything(), anything())).once();
  });

  it("calls saveProduct and saveBulkInventories for variants product", async () => {
    const dto: CreateProductType = makeProductWithVariants();

    when(productRepo.saveProduct(anything())).thenResolve(expect.anything());

    when(inventoryServiceWrite.saveInventory(anything())).thenResolve(
      expect.anything()
    );

    await useCase.createProductWithInventories(dto);

    verify(productRepo.saveProduct(anything(), anything())).once();
    verify(inventoryServiceWrite.saveBulkInventories(anything(), anything())).once();
  });

  it("retries and eventually succeeds on second attempt", async () => {
    const dto = makeDtoWithRootInventory();

    // Create a mock to track how many times saveProduct is called
    let attempt = 0;
    when(productRepo.saveProduct(anything(), anything())).thenCall(() => {
      if (attempt === 0) {
        attempt++;
        throw new MongoServerError({
                  message: "Error at test retry",
                  errorLabels: ["TransientTransactionError"], // ← THIS IS CRUCIAL
                  code: 24, // LockTimeout code
                });
      }
      return expect.anything(); // simulate success
    });

    when(inventoryServiceWrite.saveInventory(anything(), anything())).thenResolve(
      expect.anything()
    );

    const result = await useCase.createProductWithInventories(dto);
    
    // ✔ should retry saveProduct
    verify(productRepo.saveProduct(anything(), anything())).twice();
  });
});
