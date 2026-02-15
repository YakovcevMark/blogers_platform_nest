import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repo';
import { BcryptService } from '../../../core/application/bcrypt.service';
import { LoginInputDto } from '../api/input-dto/login.input-dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async validateUser(dto: LoginInputDto) {
    const { password, loginOrEmail } = dto;
    const userDB =
      await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!userDB) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Incorrect credentials',
        extensions: [],
      });
    }
    const isPasswordCorrect = await this.bcryptService.comparePasswords({
      userPassword: userDB.passwordHash,
      bodyPassword: password,
    });

    if (!isPasswordCorrect) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Incorrect credentials',
        extensions: [],
      });
    }
    return userDB;
  }
}
