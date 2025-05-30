import { Types } from "mongoose";

// Core data interface
export interface ICategoryBase{
    name: string;
    path: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  export interface ICategory extends ICategoryBase{
    id:string;
  }
  // Mongoose document interface
  export interface ICategoryDocument extends ICategoryBase, Document {
    _id:Types.ObjectId
  }
  