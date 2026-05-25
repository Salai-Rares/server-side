import bcrypt from "bcrypt";
import { IPasswordHasher } from "../../application/ports/password-hasher.port";
import { injectable } from "inversify";
@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number = 12
  constructor() {}

  async hash(raw: string): Promise<string> {
    return bcrypt.hash(raw, this.saltRounds);
  }

  async compare(raw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(raw, hash);
  }
}
