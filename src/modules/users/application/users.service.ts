import { BcryptService } from '../../../core/application/bcrypt.service';
import { Injectable } from '@nestjs/common';
import { UserModel, UserModelName } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from '../infrastructure/users.repo';
import { CreateUserInputDto } from '../api/input-dto/user.input-dto';
import { DomainNotFoundException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModelName) protected UserModel: UserModel,
    protected usersRepository: UsersRepository,
    protected bcryptService: BcryptService,
  ) {}

  async updatePassword(email: string, passwordHash: string) {
    const user = await this.usersRepository.getUserByLoginOrEmail(email);
    if (user) {
      user.setPassword(passwordHash);
      await this.usersRepository.save(user);
    }
  }

  public create = async (body: CreateUserInputDto): Promise<string> => {
    const hashedPassword = await this.bcryptService.genHashedPassword(
      body.password,
    );
    const entity = this.UserModel.createUser({
      email: body.email,
      login: body.login,
      passwordHash: hashedPassword,
    });
    await this.usersRepository.save(entity);
    return String(entity._id);
  };

  public remove = async (id: string) => {
    const isDeleted = await this.usersRepository.remove(id);
    if (!isDeleted) throw new DomainNotFoundException('User not found');
  };
}
