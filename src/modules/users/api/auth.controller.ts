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
import { LoginSuccessViewDto } from './view-dto/login-success.view-dto';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginSuccessViewDto> {
    const tokens = await this.authService.login(user.id);

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
    return this.authService.recoverPassword(body);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: ChangePasswordInputDto) {
    return this.authService.setNewPassword(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: ConfirmCodeInputDto) {
    return this.authService.confirmCode(body);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto) {
    return this.authService.registration(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() body: ResendEmailConfirmationInputDto,
  ) {
    return this.authService.resendEmailConfirmationCode(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@ExtractUserFromRequest() user: UserContextDto) {
    return this.usersQueryRepository.getCurrentSessionUser(user.id);
  }
}
