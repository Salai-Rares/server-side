import mongoose, {Document, Schema, Model} from 'mongoose'


// Define an interface that describes the shape of a Product document
export interface IProduct extends Document {
    title: string;
    description: string;
    imagePath: string;
    rating: number;
    categories: mongoose.Types.ObjectId[]; // Array of ObjectIds referencing the Category model
    quantity: number;
    price: number;
    attributes: {
      key: string;
      value: string[];
    }[];
    createdAt: Date;
    updatedAt: Date;
  }
  

const productSchema:Schema<IProduct> =new Schema({
    title: {type:String, required : true},
    description : {type:String, required:true},
    imagePath : {type:String , required : true},
    rating : {type: Number, min:0,max:5,default:0},
    categories : [{type:mongoose.Schema.Types.ObjectId , ref:'Category'}],
    quantity: Number,
    price:Number,
    attributes : {
        type:[
            {
                key:String,
                value:[String]
            }
        ],required:true
    },
    createdAt : {type:Date,default:Date.now},
    updatedAt: {type:Date,default:Date.now}
});

productSchema.path('attributes').validate((array:[{key:String,value:[String]}])=>{
    if(array.length > 10){
        throw new Error("Assigned categories size can't be larger than 10");
    }
})

const Product: Model<IProduct> = mongoose.model<IProduct>('Product',productSchema);
export default Product;

