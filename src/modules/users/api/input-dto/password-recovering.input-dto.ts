import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class PasswordRecoveringInputDto {
  @IsNotEmpty()
  @IsEmail()
  @Trim()
  email: string;
}
