// src/infrastructure/id/mongo-id-generator.ts
import { injectable } from "inversify";
import { Types } from "mongoose";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";

@injectable()
export class MongoIdGenerator implements IIdGenerator {
  generate(): string {
    return new Types.ObjectId().toHexString();
  }
}
