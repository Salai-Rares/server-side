import { RequestHandler } from "express";

export type DiskStorageOptions = {
    destination :string;
    mimetypes:Record<string,string>;
    fileSize:number
}

export type UploadWrapper = {
    single: (field: string) => RequestHandler;
    array: (field: string, maxCount?: number) => RequestHandler;
    fields: (fields: { name: string; maxCount?: number }[]) => RequestHandler;
    raw: () => RequestHandler;
  };