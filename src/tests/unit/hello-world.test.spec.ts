import { mock, when, instance, verify, anything, reset } from "ts-mockito";
import { IInventoryRepository } from "../../modules/inventory/types/inventory.repository.types";
import { CreateProductDto } from "@/modules/product/schemas";
import { ProductCreateUseCase } from "@/modules/product/services/product-create.service";
import { IProductRepository } from "@/modules/product/types/product.repository.types";
import {
  makeDtoWithRootInventory,
  makeProductWithRootInventoryAndVariants,
  makeProductWithVariants,
} from "@/tests/factories/product.factory";
import {MongoServerError} from "mongodb"
import { faker } from "@faker-js/faker";
describe("ProductCreateUseCase - Unit Tests", () => {
  const productRepo = mock<IProductRepository>();
  const inventoryRepo = mock<IInventoryRepository>();
  let useCase: ProductCreateUseCase;

  beforeEach(() => {
    reset(productRepo);
    reset(inventoryRepo);
    useCase = new ProductCreateUseCase(
      instance(productRepo),
      instance(inventoryRepo)
    );
  });
  it("throws if product has both root inventory and variants", async () => {
    const dto: CreateProductDto = makeProductWithRootInventoryAndVariants();
    console.log("Test input DTO:", JSON.stringify(dto, null, 2));
    await expect(useCase.createProductWithInventories(dto)).rejects.toThrow(
      "Root product cannot have both variants and inventory"
    );
  });

  it("calls saveProduct and saveInventory for non-variant product", async () => {
    const dto: CreateProductDto = makeDtoWithRootInventory();

    when(productRepo.saveProduct(anything())).thenResolve(expect.anything());

    when(inventoryRepo.saveInventory(anything())).thenResolve(
      expect.anything()
    );

    await useCase.createProductWithInventories(dto);

    verify(productRepo.saveProduct(anything(), anything())).once();
    verify(inventoryRepo.saveInventory(anything(), anything())).once();
  });

  it("calls saveProduct and saveBulkInventories for variants product", async () => {
    const dto: CreateProductDto = makeProductWithVariants();

    when(productRepo.saveProduct(anything())).thenResolve(expect.anything());

    when(inventoryRepo.saveInventory(anything())).thenResolve(
      expect.anything()
    );

    await useCase.createProductWithInventories(dto);

    verify(productRepo.saveProduct(anything(), anything())).once();
    verify(inventoryRepo.saveBulkInventories(anything(), anything())).once();
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

    when(inventoryRepo.saveInventory(anything(), anything())).thenResolve(
      expect.anything()
    );

    const result = await useCase.createProductWithInventories(dto);

    // ✔ should retry saveProduct
    verify(productRepo.saveProduct(anything(), anything())).twice();
  });
});
