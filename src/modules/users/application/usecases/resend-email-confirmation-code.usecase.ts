import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'crypto';
import { ResendEmailConfirmationInputDto } from '../../api/input-dto/resend-email-confirmation.input-dto';
import { SmtpManager } from '../../../../core/application/smpt.manager';
import { UsersRepository } from '../../infrastructure/users.repo';

export class ResendEmailConfirmationCommand {
  constructor(public dto: ResendEmailConfirmationInputDto) {}
}

@CommandHandler(ResendEmailConfirmationCommand)
export class ResendEmailConfirmationUseCase implements ICommandHandler<ResendEmailConfirmationCommand> {
  constructor(
    private usersRepo: UsersRepository,
    private smtpManager: SmtpManager,
  ) {}

  async execute({ dto }: ResendEmailConfirmationCommand) {
    const { email } = dto;

    const user = await this.usersRepo.getUserByLoginOrEmail(email);

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
    await this.usersRepo.save(user);
  }
}
