export interface IProductRepository {
    create(productData: any): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any | null>;
    update(id: string, productData: any): Promise<any | null>;
    delete(id: string): Promise<void>;
  }