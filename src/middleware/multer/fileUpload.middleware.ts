import multer, { StorageEngine, Multer } from "multer";
import { Request, RequestHandler } from "express";
import { DiskStorageOptions, UploadWrapper } from "./types";



const MIME_TYPE_MAP: Record<string,string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};


export const createMulterUpload = (options: DiskStorageOptions): UploadWrapper => {
  const storage: StorageEngine = multer.diskStorage({
      destination: (
          req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
      ) => {
          // Validate MIME type
          const isValid = options.mimetypes[file.mimetype];
          let error: Error | null = isValid ? null : new Error("Invalid mime type");
          cb(error, options.destination);
      },
      filename: (
          req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void
      ) => {
          const name = file.originalname.toLowerCase().split(" ").join("-");
          const ext = options.mimetypes[file.mimetype];
          cb(null, `${name}-${Date.now()}.${ext}`);
      },
     
  });

  const base = multer({
    storage,
    limits: { fileSize: options.fileSize },
  });

  return {
    single: (field: string) => base.single(field),
    array: (field: string, maxCount = 5) => base.array(field, maxCount),
    fields: (fields: { name: string; maxCount?: number }[]) => base.fields(fields),
    raw: () => base.any(),
  };
};
