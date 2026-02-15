import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { ChangePasswordInputDto } from '../../api/input-dto/change-password.input-dto';
import { BcryptService } from '../../../../core/application/bcrypt.service';
import {
  PasswordRecoveryCodeModel,
  PasswordRecoveryCodeModelName,
} from '../../domain/password-recovery-code.entity';
import { PasswordRecoveryCodesRepository } from '../../infrastructure/password-recovery-code.repo';
import { UsersRepository } from '../../infrastructure/users.repo';

export class ChangePasswordCommand {
  constructor(public dto: ChangePasswordInputDto) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @InjectModel(PasswordRecoveryCodeModelName)
    private PasswordRecoveryCodeModel: PasswordRecoveryCodeModel,
    private passwordRecoveryCodesRepo: PasswordRecoveryCodesRepository,
    private bcryptService: BcryptService,
    private usersRepo: UsersRepository,
  ) {}

  async execute({ dto }: ChangePasswordCommand) {
    const { password, recoveryCode } = dto;
    const passwordRecoveryRecordDB =
      await this.passwordRecoveryCodesRepo.getByCode(recoveryCode);

    this.PasswordRecoveryCodeModel.validateCode(passwordRecoveryRecordDB);

    passwordRecoveryRecordDB?.setIsActive(false);

    const [hashedPassword] = await Promise.all([
      this.bcryptService.genHashedPassword(password),
      this.passwordRecoveryCodesRepo.save(passwordRecoveryRecordDB!),
    ]);

    const user = await this.usersRepo.getUserByLoginOrEmail(
      passwordRecoveryRecordDB!.email,
    );

    if (user) {
      user.setPassword(hashedPassword);
      await this.usersRepo.save(user);
    }
  }
}
