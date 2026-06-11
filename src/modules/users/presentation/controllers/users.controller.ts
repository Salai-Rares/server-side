import { Request, Response } from "express";
import {
  BaseHttpController,
  controller,
  httpPost,
} from "inversify-express-utils";
import {
  CreateUserHttpDto,
  CreateUserSchema,
} from "../schemas/create-user.schema";
import { LoginHttpDto, LoginSchema } from "../schemas/login.schema";
import { ResetPasswordDto, ResetPasswordSchema } from "../schemas/reset-password.schema";
import { inject } from "inversify";
import { USERS_TYPES } from "../../infrastructure/di/users.symbols";
import { IUserRegisterUseCase } from "../../application/use-cases/register/user-register.interface";
import { IUserLoginUseCase } from "../../application/use-cases/login/user-login.use-case.interface";
import { IForgotPasswordUseCase } from "../../application/use-cases/forgot-password/forgot-password.use-case.interface";
import { IResetPasswordUseCase } from "../../application/use-cases/reset-password/reset-password.use-case.interface";
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
    @inject(USERS_TYPES.ForgotPasswordUseCase)
    private forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject(USERS_TYPES.ResetPasswordUseCase)
    private resetPasswordUseCase: IResetPasswordUseCase,
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
    req.session.role = userEntity.role;
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
    req.session.role = userEntity.role;
    res.status(HttpStatus.OK).json({ success: true, data: UserEntityToResponseMapper.toDto(userEntity) });
  }

  @httpPost("/logout")
  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) throw ApiError.internalError("Logout failed", err);
      res.status(HttpStatus.OK).json({ success: true, data: { message: "Logged out" } });
    });
  }

  @httpPost("/forgot-password")
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email || typeof email !== "string") throw ApiError.badRequest("Email is required");
    await this.forgotPasswordUseCase.execute(email.toLowerCase().trim());
    res.status(HttpStatus.OK).json({ success: true, data: { message: "If an account with that email exists, you will receive a reset link." } });
  }

  @httpPost("/reset-password")
  async resetPassword(req: Request, res: Response) {
    const dto: ResetPasswordDto = ResetPasswordSchema.parse(req.body);
    await this.resetPasswordUseCase.execute({ token: dto.token, newPassword: dto.password });
    res.status(HttpStatus.OK).json({ success: true, data: { message: "Password updated successfully" } });
  }

  @httpPost("/verify-email")
  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body;
    if (!token || typeof token !== "string") throw ApiError.badRequest("Token is required");
    await this.verifyEmailUseCase.execute(token);
    res.status(HttpStatus.OK).json({ success: true, data: { message: "Email verified successfully" } });
  }
}
