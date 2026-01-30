import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { addMinutes } from 'date-fns';
import { CreateUserDomainDto } from './create-user-domain.input-dto';

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
  @Prop({ type: String, required: true })
  isConfirmed: boolean;
}

const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
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

  setLogin(login: string) {
    this.login = login;
  }

  setEmail(email: string) {
    this.email = email;
  }

  setPassword(password: string) {
    this.passwordHash = password;
  }

  setEmailConfirmation() {
    this.emailConfirmation.isConfirmed = true;
  }

  addEmailConfirmationCode(code: string) {
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
