import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserDocument,
  type UserModel,
  UserModelName,
} from '../domain/user.entity';
import { getDbFilters } from '../../../core/utils/get-db-filters';
import { UserViewDto } from '../api/view-dto/users.view-dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(UserModelName) private UserModel: UserModel) {}

  public getById = async (id?: string): Promise<UserDocument | null> => {
    return this.UserModel.findOne({ _id: new ObjectId(id) });
  };

  public getByCode = async (code: string): Promise<UserDocument | null> => {
    return this.UserModel.findOne({
      'emailConformation.codes.code': code,
    });
  };
  public getUserByLoginOrEmail = async (
    loginOrEmail: string,
  ): Promise<UserDocument | null> => {
    return this.UserModel.findOne(
      getDbFilters<UserViewDto>([
        { fieldName: 'login', queryParam: loginOrEmail, isStrictEqual: true },
        { fieldName: 'email', queryParam: loginOrEmail, isStrictEqual: true },
      ]),
    );
  };

  public isUserWithEmailExist = async (email: string): Promise<boolean> => {
    const count = await this.UserModel.countDocuments(
      getDbFilters<UserViewDto>([
        { fieldName: 'email', queryParam: email, isStrictEqual: true },
      ]),
    );
    return count > 0;
  };

  public isUserWithLoginExist = async (login: string): Promise<boolean> => {
    const count = await this.UserModel.countDocuments(
      getDbFilters<UserViewDto>([
        { fieldName: 'login', queryParam: login, isStrictEqual: true },
      ]),
    );
    return count > 0;
  };

  async save(model: UserDocument) {
    await model.save();
  }

  public remove = async (id: string): Promise<boolean> => {
    const response = await this.UserModel.deleteOne({ _id: new ObjectId(id) });
    return response.deletedCount > 0;
  };
}
