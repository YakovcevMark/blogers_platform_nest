//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { IsEmail } from 'class-validator';

export class CreateUserInputDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password: string;
  @IsEmail({})
  email: string;
}
