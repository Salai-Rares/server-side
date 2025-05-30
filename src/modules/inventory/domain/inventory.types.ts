export interface InventoryProps{
    id:string,
    referenceType:"product"|"variant",
    referenceId:string,
    stock:number,
    inStock:boolean,
    warehouseLocation?:string,
    createdAt?:Date,
    updatedAt?:Date
}