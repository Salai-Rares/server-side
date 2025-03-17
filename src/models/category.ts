import mongoose , {Schema, Model} from "mongoose";

const categorySchema =  new Schema<{name:string}>({
    name : {type:String,required:true}
})

const Category : Model<{name:string}>  = mongoose.model<{name:string}>("Category",categorySchema);
export default Category;