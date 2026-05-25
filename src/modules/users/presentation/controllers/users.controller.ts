import { Request, Response } from "express";
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
} from "inversify-express-utils";
import {
  CreateUserHttpDto,
  CreateUserSchema,
} from "../schemas/create-user.schema";
import { LoginHttpDto, LoginSchema } from "../schemas/login.schema";
import { inject } from "inversify";
import { USERS_TYPES } from "../../infrastructure/di/users.symbols";
import { IUserRegisterUseCase } from "../../application/use-cases/register/user-register.interface";
import { IUserLoginUseCase } from "../../application/use-cases/login/user-login.use-case.interface";
import { IVerifyEmailUseCase } from "../../application/use-cases/verify-email/verify-email.use-case.interface";
import { UserEntity } from "../../domain/entities/user.entity";
import { HttpStatus } from "@/constants/errors.constants";
import { UserEntityToResponseMapper } from "../../infrastructure/mappers/entity-to-response.mapper";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@controller("/api/v1/users")
export class UserController extends BaseHttpController {
  constructor(
    @inject(USERS_TYPES.UserRegisterUseCase)
    private userRegisterUseCase: IUserRegisterUseCase,
    @inject(USERS_TYPES.UserLoginUseCase)
    private userLoginUseCase: IUserLoginUseCase,
    @inject(USERS_TYPES.VerifyEmailUseCase)
    private verifyEmailUseCase: IVerifyEmailUseCase
  ) {
    super();
  }

  @httpPost("/create")
  async createUser(req: Request, res: Response) {
    const userDto: CreateUserHttpDto = CreateUserSchema.parse(req.body);
    const userEntity: UserEntity = await this.userRegisterUseCase.execute(userDto);
    req.session.userId = userEntity.id;
    delete req.session.guestId;
    res.status(HttpStatus.CREATED).json({ success: true, data: UserEntityToResponseMapper.toDto(userEntity) });
  }

  @httpPost("/login")
  async login(req: Request, res: Response) {
    const dto: LoginHttpDto = LoginSchema.parse(req.body);
    const userEntity: UserEntity = await this.userLoginUseCase.execute(dto);
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    req.session.userId = userEntity.id;
    res.status(HttpStatus.OK).json({ success: true, data: UserEntityToResponseMapper.toDto(userEntity) });
  }

  @httpPost("/logout")
  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) throw ApiError.internalError("Logout failed", err);
      res.status(HttpStatus.OK).json({ success: true, data: { message: "Logged out" } });
    });
  }

  @httpGet("/verify-email")
  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;
    if (!token || typeof token !== "string") throw ApiError.badRequest("Token is required");
    await this.verifyEmailUseCase.execute(token);
    res.status(200).json({ success: true, data: { message: "Email verified successfully" } });
  }
}
