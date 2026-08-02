

import Inventory from "@/modules/inventory/models/inventory.model";
import Product from "@/modules/product/models/product";
import Cart from "@/modules/cart/models/cart.model";



export async function initAllIndexes(): Promise<void> {
console.log('start init indexing')
  await Promise.all([
    Inventory.syncIndexes(),
    Product.syncIndexes(),
    Cart.syncIndexes()
    // Add more model.syncIndexes() calls here
  ]);

  console.info("✅ Index syncing complete.");
}
