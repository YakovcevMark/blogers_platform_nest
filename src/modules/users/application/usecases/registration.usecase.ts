import { CreateUserInputDto } from '../../api/input-dto/user.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../infrastructure/users.repo';
import { InjectModel } from '@nestjs/mongoose';
import { UserModelName, UserModel } from '../../domain/user.entity';
import { BcryptService } from '../../../../core/application/bcrypt.service';
import { SmtpManager } from '../../../../core/application/smpt.manager';

export class RegistrationCommand {
  constructor(public dto: CreateUserInputDto) {}
}
@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand> {
  constructor(
    @InjectModel(UserModelName) private UserModel: UserModel,
    private usersRepo: UsersRepository,
    private bcryptService: BcryptService,
    private smtpManager: SmtpManager,
  ) {}

  async execute({ dto }: RegistrationCommand) {
    const { login, email, password } = dto;

    const isUserWithGivenEmailAlreadyExist =
      await this.usersRepo.isUserWithEmailExist(email);
    const isUserWithGivenLoginAlreadyExist =
      await this.usersRepo.isUserWithLoginExist(login);

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
    await this.usersRepo.save(newUser);
  }
}
