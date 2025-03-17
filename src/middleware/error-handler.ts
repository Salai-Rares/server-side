import { Request, Response, NextFunction } from "express";
import { injectable } from "inversify";
import { BaseError } from "../errors/BaseError";

@injectable() // ✅ Now Inversify can manage this middleware
export class GlobalErrorHandler {
  handle(err: Error | BaseError, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let message = "Something went wrong!";
    let stack = err.stack || "";

    if (err instanceof BaseError) {
      statusCode = err.statusCode;
      message = err.message;
    }

    if (err instanceof BaseError && !err.isOperational) {
      console.error(`Non-operational error: ${err.stack}`);
      message = "Internal Server Error";
    }

    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === "production" ? null : stack,
    });
  }
}
