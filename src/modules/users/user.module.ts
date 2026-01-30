import { Module } from '@nestjs/common';
import { UserModelName, UserSchema } from './domain/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/query-repo';
import { UsersRepository } from './infrastructure/repo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModelName, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UserService, UsersQueryRepository, UsersRepository],
  exports: [UsersRepository],
})
export class UserModule {}
