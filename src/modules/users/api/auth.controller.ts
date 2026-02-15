import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/users.query-repo';
import { CreateUserInputDto } from './input-dto/user.input-dto';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { PasswordRecoveringInputDto } from './input-dto/password-recovering.input-dto';
import { ChangePasswordInputDto } from './input-dto/change-password.input-dto';
import { ConfirmCodeInputDto } from './input-dto/confirm-code.input-dto';
import { ResendEmailConfirmationInputDto } from './input-dto/resend-email-confirmation.input-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  LoginCommandSuccessViewDto,
  LoginSuccessViewDto,
} from './view-dto/login-success.view-dto';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants';
import { Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegistrationCommand } from '../application/usecases/registration.usecase';
import { ConfirmEmailCodeCommand } from '../application/usecases/confirm-email-code.usecase';
import { RecoverPasswordCommand } from '../application/usecases/recover-password.usecase';
import { ChangePasswordCommand } from '../application/usecases/change-password.usecase';
import { ResendEmailConfirmationCommand } from '../application/usecases/resend-email-confirmation-code.usecase';
import { LoginCommand } from '../application/usecases/login.usecase';
import { GetCurrentSessionUserQuery } from '../application/queries/get-current-session-user.query';
import { CurrentSessionUserViewDto } from './view-dto/current-session-user.view-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginSuccessViewDto> {
    const tokens = await this.commandBus.execute<
      LoginCommand,
      LoginCommandSuccessViewDto
    >(new LoginCommand(user.id));

    response.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveringInputDto) {
    return this.commandBus.execute(new RecoverPasswordCommand(body));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: ChangePasswordInputDto) {
    return this.commandBus.execute(new ChangePasswordCommand(body));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: ConfirmCodeInputDto) {
    return this.commandBus.execute(new ConfirmEmailCodeCommand(body));
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto) {
    return this.commandBus.execute(new RegistrationCommand(body));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() body: ResendEmailConfirmationInputDto,
  ) {
    return this.commandBus.execute(new ResendEmailConfirmationCommand(body));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@ExtractUserFromRequest() user: UserContextDto) {
    return this.queryBus.execute<
      GetCurrentSessionUserQuery,
      CurrentSessionUserViewDto
    >(new GetCurrentSessionUserQuery(user.id));
  }
}
