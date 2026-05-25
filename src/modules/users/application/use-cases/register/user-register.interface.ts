import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { CreateUserHttpDto } from "../../../presentation/schemas/create-user.schema";
import { CreateUserCommand } from "../../dtos/auth/register.dto";

export interface IUserRegisterUseCase {
    execute(userDto: CreateUserCommand) : Promise<UserEntity>;
}