import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveringInputDto } from '../../api/input-dto/password-recovering.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  PasswordRecoveryCodeModel,
  PasswordRecoveryCodeModelName,
} from '../../domain/password-recovery-code.entity';
import { PasswordRecoveryCodesRepository } from '../../infrastructure/password-recovery-code.repo';
import { SmtpManager } from '../../../../core/application/smpt.manager';

export class RecoverPasswordCommand {
  constructor(public dto: PasswordRecoveringInputDto) {}
}
@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase implements ICommandHandler<RecoverPasswordCommand> {
  constructor(
    @InjectModel(PasswordRecoveryCodeModelName)
    private PasswordRecoveryCodeModel: PasswordRecoveryCodeModel,
    private passwordRecoveryCodesRepo: PasswordRecoveryCodesRepository,
    private smtpManager: SmtpManager,
  ) {}

  async execute({ dto }: RecoverPasswordCommand) {
    const code = this.PasswordRecoveryCodeModel.createPasswordRecoveryCode({
      email: dto.email,
    });
    this.smtpManager.sendPasswordRecoveryCodeEmail({
      email: dto.email,
      code: code.code,
    });
    await this.passwordRecoveryCodesRepo.save(code);
  }
}
