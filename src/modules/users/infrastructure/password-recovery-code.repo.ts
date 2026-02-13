import { InjectModel } from '@nestjs/mongoose';
import {
  PasswordRecoveryCodeModelName,
  PasswordRecoveryCodeModel,
  PasswordRecoveryCodeDocument,
} from '../domain/password-recovery-code.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordRecoveryCodesRepository {
  constructor(
    @InjectModel(PasswordRecoveryCodeModelName)
    private PasswordRecoveryCodeModel: PasswordRecoveryCodeModel,
  ) {}

  public async getByCode(
    code: string,
  ): Promise<PasswordRecoveryCodeDocument | null> {
    return this.PasswordRecoveryCodeModel.findOne({ code });
  }

  async save(entity: PasswordRecoveryCodeDocument) {
    await entity.save();
  }
}
