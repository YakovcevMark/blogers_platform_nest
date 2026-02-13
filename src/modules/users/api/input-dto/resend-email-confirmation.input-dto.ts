import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class ResendEmailConfirmationInputDto {
  @IsNotEmpty()
  @IsEmail()
  @Trim()
  email: string;
}
