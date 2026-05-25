import { EntityStatusVO } from "@/core/domain/value-objects/status.value-objects"

export interface InventoryProps{
    id:string,
    referenceRootId:string,
    referenceVariantId?:string,
    stock:number,
    warehouseLocation?:string,
    status : EntityStatusVO
    createdAt?:Date,
    updatedAt?:Date
}


