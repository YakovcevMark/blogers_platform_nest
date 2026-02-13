import { IsNotEmpty } from 'class-validator';

export class ConfirmCodeInputDto {
  @IsNotEmpty()
  code: string;
}
