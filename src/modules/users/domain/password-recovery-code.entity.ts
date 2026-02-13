import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePasswordRecoveryCodeDomainDto } from './create-password-recovery-code-domain.input-dto';
import { randomUUID } from 'node:crypto';
import { addMinutes } from 'date-fns';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Schema()
export class PasswordRecoveryCode {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  code: string;

  @Prop({ type: Date, required: true, expires: 0 })
  expireAt: Date;

  @Prop({ type: Boolean, required: true })
  isActive: boolean;

  setIsActive(isActive: boolean) {
    this.isActive = isActive;
  }

  static validateCode(
    passwordRecoveryCode: PasswordRecoveryCodeDocument | null,
  ) {
    if (!passwordRecoveryCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code not found',
        extensions: [{ field: 'recoveryCode', message: 'not found' }],
      });
    }

    if (passwordRecoveryCode.expireAt < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Expired code',
        extensions: [
          { field: 'recoveryCode', message: 'code has already expired' },
        ],
      });
    }
  }

  static createPasswordRecoveryCode(
    dto: CreatePasswordRecoveryCodeDomainDto,
  ): PasswordRecoveryCodeDocument {
    const { email } = dto;
    const record = new this();
    record.email = email;
    record.code = randomUUID();
    record.expireAt = addMinutes(new Date(), 10);
    return record as PasswordRecoveryCodeDocument;
  }
}

export type PasswordRecoveryCodeDocument =
  HydratedDocument<PasswordRecoveryCode>;
export const PasswordRecoveryCodeSchema =
  SchemaFactory.createForClass(PasswordRecoveryCode);
PasswordRecoveryCodeSchema.loadClass(PasswordRecoveryCode);
export type PasswordRecoveryCodeModel = Model<PasswordRecoveryCodeDocument> &
  typeof PasswordRecoveryCode;
export const PasswordRecoveryCodeModelName = PasswordRecoveryCode.name;
