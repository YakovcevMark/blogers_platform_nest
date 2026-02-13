import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repo';
import { SmtpManager } from '../../../core/application/smpt.manager';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../core/application/bcrypt.service';
import { PasswordRecoveryCodesRepository } from '../infrastructure/password-recovery-code.repo';
import { UsersService } from './users.service';
import { InjectModel } from '@nestjs/mongoose';
import {
  PasswordRecoveryCodeModel,
  PasswordRecoveryCodeModelName,
} from '../domain/password-recovery-code.entity';
import { PasswordRecoveringInputDto } from '../api/input-dto/password-recovering.input-dto';
import { ChangePasswordInputDto } from '../api/input-dto/change-password.input-dto';
import { LoginInputDto } from '../api/input-dto/login.input-dto';
import { UserModelName, UserModel } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'crypto';
import { ConfirmCodeInputDto } from '../api/input-dto/confirm-code.input-dto';
import { ResendEmailConfirmationInputDto } from '../api/input-dto/resend-email-confirmation.input-dto';
import { CreateUserInputDto } from '../api/input-dto/user.input-dto';
import { LoginCommandSuccessViewDto } from '../api/view-dto/login-success.view-dto';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  REFRESH_TOKEN_INJECT_TOKEN,
} from '../constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(PasswordRecoveryCodeModelName)
    private PasswordRecoveryCodeModel: PasswordRecoveryCodeModel,
    @InjectModel(UserModelName) private UserModel: UserModel,
    private usersRepository: UsersRepository,
    private smtpManager: SmtpManager,
    @Inject(ACCESS_TOKEN_INJECT_TOKEN)
    private accessTokenJwtService: JwtService,
    @Inject(REFRESH_TOKEN_INJECT_TOKEN)
    private refreshTokenJwtService: JwtService,
    private bcryptService: BcryptService,
    private passwordRecoveryCodesRepository: PasswordRecoveryCodesRepository,
    private usersService: UsersService,
  ) {}

  // async validate(dto: LoginInputDto) {
  //   const { loginOrEmail, password } = dto;
  // }

  async registration(dto: CreateUserInputDto) {
    const { login, email, password } = dto;

    const isUserWithGivenEmailAlreadyExist =
      await this.usersRepository.isUserWithEmailExist(email);
    const isUserWithGivenLoginAlreadyExist =
      await this.usersRepository.isUserWithLoginExist(login);

    if (isUserWithGivenEmailAlreadyExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with given email already exist',
        extensions: [
          { field: 'email', message: 'User with given email already exist' },
        ],
      });
    }

    if (isUserWithGivenLoginAlreadyExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with given login already exist',
        extensions: [
          { field: 'login', message: 'User with given email already exist' },
        ],
      });
    }

    const passwordHash = await this.bcryptService.genHashedPassword(password);

    const code = randomUUID();

    const newUser = this.UserModel.createUser({
      email,
      login,
      passwordHash,
    });
    newUser.addEmailConfirmationCode(code);
    this.smtpManager.sendRegistrationCodeEmail({ email, code });
    await this.usersRepository.save(newUser);
  }

  async confirmCode(dto: ConfirmCodeInputDto) {
    const { code } = dto;

    const user = await this.usersRepository.getByCode(code);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'No user found with that code',
        extensions: [
          { field: 'code', message: 'No user found with that code' },
        ],
      });
    }

    user.setEmailConfirmation(code);
    await this.usersRepository.save(user);
  }

  async recoverPassword(dto: PasswordRecoveringInputDto) {
    const code = this.PasswordRecoveryCodeModel.createPasswordRecoveryCode({
      email: dto.email,
    });
    this.smtpManager.sendPasswordRecoveryCodeEmail({
      email: dto.email,
      code: code.code,
    });
    await this.passwordRecoveryCodesRepository.save(code);
  }

  async setNewPassword(dto: ChangePasswordInputDto) {
    const { password, recoveryCode } = dto;
    const passwordRecoveryRecordDB =
      await this.passwordRecoveryCodesRepository.getByCode(recoveryCode);

    this.PasswordRecoveryCodeModel.validateCode(passwordRecoveryRecordDB);

    passwordRecoveryRecordDB?.setIsActive(false);

    const [hashedPassword] = await Promise.all([
      this.bcryptService.genHashedPassword(password),
      this.passwordRecoveryCodesRepository.save(passwordRecoveryRecordDB!),
    ]);

    await this.usersService.updatePassword(
      passwordRecoveryRecordDB!.email,
      hashedPassword,
    );
  }

  async resendEmailConfirmationCode(params: ResendEmailConfirmationInputDto) {
    const { email } = params;

    const user = await this.usersRepository.getUserByLoginOrEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'No user found with given email',
        extensions: [
          { field: 'email', message: 'No user found with given email' },
        ],
      });
    }

    const code = randomUUID();
    user.addEmailConfirmationCode(code);
    this.smtpManager.sendRegistrationCodeEmail({ email, code });
    await this.usersRepository.save(user);
  }

  async validateUser(dto: LoginInputDto) {
    const { password, loginOrEmail } = dto;
    const userDB =
      await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!userDB) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Incorrect credentials',
        extensions: [],
      });
    }
    const isPasswordCorrect = await this.bcryptService.comparePasswords({
      userPassword: userDB.passwordHash,
      bodyPassword: password,
    });

    if (!isPasswordCorrect) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Incorrect credentials',
        extensions: [],
      });
    }
    return userDB;
  }

  async login(userId: string): Promise<LoginCommandSuccessViewDto> {
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

  // public refreshToken = async (
  //   userId: string,
  //   cookieToken: string,
  //   deviceName: string,
  //   ip: string,
  //   deviceId: string,
  // ): Promise<
  //   Result<{
  //     accessToken: string;
  //     refreshToken: string;
  //   } | null>
  // > => {
  //   const tokens = await this.generateTokens(userId, deviceId);
  //
  //   const refreshTokenHeaderAndPayload = await this.jwtService.verifyToken(
  //     tokens.refreshToken,
  //   );
  //
  //   await this.sessionDevicesService.update({
  //     deviceId,
  //     expireAt: new Date(refreshTokenHeaderAndPayload!.exp),
  //     title: deviceName,
  //     ip,
  //     lastActiveDate: new Date(refreshTokenHeaderAndPayload!.iat),
  //     userId,
  //   });
  //
  //   return {
  //     status: SERVICE_RESULT_CODES.OK,
  //     data: tokens,
  //   };
  // };

  // public logout = async (
  //   cookieToken: string,
  //   deviceId: string,
  //   userId: string,
  // ): Promise<Result> => {
  //   await this.sessionDevicesService.remove(deviceId, userId);
  //
  //   return {
  //     status: SERVICE_RESULT_CODES.OK,
  //   };
  // };
}
