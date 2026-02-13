import { Module } from '@nestjs/common';
import { UserModelName, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/users.query-repo';
import { UsersRepository } from './infrastructure/users.repo';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
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
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
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
