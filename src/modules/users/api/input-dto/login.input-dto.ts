import { Trim } from '../../../../core/decorators/transform/trim';

export class LoginInputDto {
  @Trim()
  loginOrEmail: string;
  @Trim()
  password: string;
}
