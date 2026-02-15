import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  REFRESH_TOKEN_INJECT_TOKEN,
} from '../../constants';
import { JwtService } from '@nestjs/jwt';
import { LoginCommandSuccessViewDto } from '../../api/view-dto/login-success.view-dto';

export class LoginCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<
  LoginCommand,
  LoginCommandSuccessViewDto
> {
  constructor(
    @Inject(ACCESS_TOKEN_INJECT_TOKEN)
    private accessTokenJwtService: JwtService,
    @Inject(REFRESH_TOKEN_INJECT_TOKEN)
    private refreshTokenJwtService: JwtService,
  ) {}

  async execute({ userId }: LoginCommand): Promise<LoginCommandSuccessViewDto> {
    const payload = { userId };
    const tokens = await Promise.all([
      this.accessTokenJwtService.signAsync(payload),
      this.refreshTokenJwtService.signAsync(payload),
    ]);
    return {
      accessToken: tokens[0],
      refreshToken: tokens[1],
    };
  }
}
