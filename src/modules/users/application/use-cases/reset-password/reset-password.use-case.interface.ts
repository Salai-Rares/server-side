export interface ResetPasswordCommand {
  token: string;
  newPassword: string;
}

export interface IResetPasswordUseCase {
  execute(command: ResetPasswordCommand): Promise<void>;
}
