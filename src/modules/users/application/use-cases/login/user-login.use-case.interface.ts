import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { LoginCommand } from "../../dtos/auth/login.dto";

export interface IUserLoginUseCase {
  execute(command: LoginCommand): Promise<UserEntity>;
}
