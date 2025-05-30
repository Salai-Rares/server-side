import { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

export const cleanupUploadedFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send.bind(res);

  // Create a new send function that handles cleanup but maintains the Response return type
  const newSend = function (this: Response, body?: any): Response {
    // Fire-and-forget the async cleanup
    const cleanup = async () => {
      if (res.statusCode >= 400 && req.file) {
        try {
          await fs.unlink(req.file.path);
          console.log(`Cleaned up file: ${req.file.path}`);
        } catch (err) {
          console.error("Failed to cleanup file:", err);
        }
      }
    };

    cleanup().catch(console.error);

    // Return the original synchronous response
    return originalSend(body);
  };

  // Type assertion is safe here because we maintain the same signature
  res.send = newSend;

  return next();
  
};
