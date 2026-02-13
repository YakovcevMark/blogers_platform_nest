import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { addMinutes } from 'date-fns';
import { CreateUserDomainDto } from './create-user-domain.input-dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  // match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

@Schema({ id: false })
class Code {
  @Prop({ type: Date, required: true })
  expired_in: Date;
  @Prop({ type: String, required: true })
  code: string;
}

const CodeSchema = SchemaFactory.createForClass(Code);

@Schema({ id: false })
class EmailConfirmation {
  @Prop({ type: [CodeSchema], required: true })
  codes: Code[];
  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;
}

const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    ...loginConstraints,
  })
  login: string;

  @Prop({ required: true, unique: true, ...emailConstraints })
  email: string;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  setPassword(password: string) {
    this.passwordHash = password;
  }

  setEmailConfirmation(code: string) {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed ',
        extensions: [{ field: 'code', message: 'Already confirmed' }],
      });
    }
    let isCodeConfirmed = false;

    this.emailConfirmation.codes.forEach((codeObj) => {
      if (isCodeConfirmed) return;
      if (codeObj.code === code) {
        if (codeObj.expired_in > new Date()) {
          isCodeConfirmed = true;
          return;
        }
      }
    });

    if (!isCodeConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code is expired',
        extensions: [{ field: 'code', message: 'Code is expired' }],
      });
    }

    this.emailConfirmation.isConfirmed = true;
  }

  addEmailConfirmationCode(code: string) {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email has already confirmed',
        extensions: [
          { field: 'email', message: 'Email has already confirmed' },
        ],
      });
    }
    this.emailConfirmation.codes.push({
      code,
      expired_in: addMinutes(new Date(), 30),
    });
  }

  static createUser(dto: CreateUserDomainDto): UserDocument {
    const { login, passwordHash, email } = dto;
    const user = new this();
    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;
    user.createdAt = new Date();
    user.emailConfirmation = {
      codes: [],
      isConfirmed: false,
    };
    return user as UserDocument;
  }
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type UserModel = Model<UserDocument> & typeof User;
export const UserModelName = User.name;
