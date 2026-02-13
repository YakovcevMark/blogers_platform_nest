import { UserDocument } from '../../domain/user.entity';

export class CurrentSessionUserViewDto {
  userId: string;
  login: string;
  email: string;

  static mapToView(user: UserDocument): CurrentSessionUserViewDto {
    const dto = new CurrentSessionUserViewDto();
    dto.userId = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    return dto;
  }
}
