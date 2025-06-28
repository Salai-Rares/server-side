import { ClientSession } from "mongoose"

export interface IInventoryRepositoryDelete{
    deleteInventoryPermanentByReference(referenceRootId:string,referenceVariantId?:string, options?: { session: ClientSession }):Promise<number>
    deleteInventoryPermanentById(id:string,productId:string ,options?: { session: ClientSession }):Promise<number>
}