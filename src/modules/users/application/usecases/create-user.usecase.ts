import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { BcryptService } from '../../../../core/application/bcrypt.service';
import { UsersRepository } from '../../infrastructure/users.repo';
import { CreateUserInputDto } from '../../api/input-dto/user.input-dto';
import { UserModel, UserModelName } from '../../domain/user.entity';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  string
> {
  constructor(
    @InjectModel(UserModelName) protected UserModel: UserModel,
    private bcryptService: BcryptService,
    private usersRepo: UsersRepository,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const hashedPassword = await this.bcryptService.genHashedPassword(
      dto.password,
    );
    const entity = this.UserModel.createUser({
      email: dto.email,
      login: dto.login,
      passwordHash: hashedPassword,
    });
    await this.usersRepo.save(entity);
    return String(entity._id);
  }
}
