export interface InventoryProps{
    id:string,
    referenceRootId:string,
    referenceVariantId?:string,
    stock:number,
    warehouseLocation?:string,
    createdAt?:Date,
    updatedAt?:Date
}