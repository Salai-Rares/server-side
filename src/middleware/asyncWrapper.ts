import { Request,Response,NextFunction } from "express";

type AsyncFunction = (req :Request,res:Response,next:NextFunction) => Promise<void>

const asyncWrapper = (fn:AsyncFunction) => {
  return async (req:Request, res:Response, next:NextFunction) :Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

 export default asyncWrapper ;
