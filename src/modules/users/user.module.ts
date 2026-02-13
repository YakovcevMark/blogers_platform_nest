import { Module } from '@nestjs/common';
import { UserModelName, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/users.query-repo';
import { UsersRepository } from './infrastructure/users.repo';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  jwtConstants,
  REFRESH_TOKEN_INJECT_TOKEN,
} from './constants';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './guards/stratigies/local-auth.strategy';
import { JwtStrategy } from './guards/stratigies/jwt-auth.strategy';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { BcryptService } from '../../core/application/bcrypt.service';
import { PasswordRecoveryCodesRepository } from './infrastructure/password-recovery-code.repo';
import {
  PasswordRecoveryCodeModelName,
  PasswordRecoveryCodeSchema,
} from './domain/password-recovery-code.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    MongooseModule.forFeature([{ name: UserModelName, schema: UserSchema }]),
    MongooseModule.forFeature([
      {
        name: PasswordRecoveryCodeModelName,
        schema: PasswordRecoveryCodeSchema,
      },
    ]),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    {
      provide: ACCESS_TOKEN_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: jwtConstants.access_token_secret,
          signOptions: { expiresIn: '15m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },

    {
      provide: REFRESH_TOKEN_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: jwtConstants.refresh_token_secret,
          signOptions: { expiresIn: '25m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },

    UsersService,
    UsersQueryRepository,
    UsersRepository,
    LocalStrategy,
    JwtStrategy,
    AuthService,
    BcryptService,
    PasswordRecoveryCodesRepository,
  ],
  exports: [UsersRepository],
})
export class UserModule {}
