import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ConfirmCodeInputDto } from '../../api/input-dto/confirm-code.input-dto';
import { UsersRepository } from '../../infrastructure/users.repo';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class ConfirmEmailCodeCommand {
  constructor(public dto: ConfirmCodeInputDto) {}
}
@CommandHandler(ConfirmEmailCodeCommand)
export class ConfirmEmailCodeUseCase implements ICommandHandler<ConfirmEmailCodeCommand> {
  constructor(private usersRepo: UsersRepository) {}

  async execute({ dto }: ConfirmEmailCodeCommand) {
    const { code } = dto;
    const user = await this.usersRepo.getByCode(code);
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
    await this.usersRepo.save(user);
  }
}
