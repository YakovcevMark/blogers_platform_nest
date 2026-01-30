import { ObjectId } from 'mongodb';
import { getDbFilters } from '../../../core/utils/get-db-filters';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/users.view-dto';
import { UserModel, UserModelName } from '../domain/user.entity';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params.input-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(UserModelName) private UserModel: UserModel) {}

  private getListFilter(
    params: Partial<
      Pick<GetUsersQueryParams, 'searchLoginTerm' | 'searchEmailTerm'>
    > & {
      isStrictEqual?: boolean;
    },
  ) {
    const { searchLoginTerm, searchEmailTerm, isStrictEqual } = params;
    return getDbFilters<UserViewDto>([
      { fieldName: 'login', queryParam: searchLoginTerm, isStrictEqual },
      { fieldName: 'email', queryParam: searchEmailTerm, isStrictEqual },
    ]);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const items = await this.UserModel.find(
      this.getListFilter({
        searchLoginTerm: query.searchLoginTerm,
        searchEmailTerm: query.searchEmailTerm,
        isStrictEqual: false,
      }),
    )
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.getCount({
      searchLoginTerm: query.searchLoginTerm,
      searchEmailTerm: query.searchEmailTerm,
    });

    return PaginatedViewDto.mapToView({
      pageSize: query.pageSize,
      items: items.map(UserViewDto.mapToView),
      page: query.pageNumber,
      totalCount,
    });
  }

  async getById(id: string): Promise<UserViewDto | null> {
    const entity = await this.UserModel.findOne({
      _id: new ObjectId(id),
    }).lean();
    if (entity) {
      return UserViewDto.mapToView(entity);
    }
    return null;
  }

  async isUserWithEmailExist(email: string): Promise<boolean> {
    const count = await this.UserModel.countDocuments(
      getDbFilters<UserViewDto>([
        { fieldName: 'email', queryParam: email, isStrictEqual: true },
      ]),
    );
    return count > 0;
  }

  async isUserWithLoginExist(login: string): Promise<boolean> {
    const count = await this.UserModel.countDocuments(
      getDbFilters<UserViewDto>([
        { fieldName: 'login', queryParam: login, isStrictEqual: true },
      ]),
    );
    return count > 0;
  }

  async getCount(
    params: Partial<
      Pick<GetUsersQueryParams, 'searchLoginTerm' | 'searchEmailTerm'>
    > & {
      isValidation?: boolean;
    },
  ): Promise<number> {
    const { searchLoginTerm, searchEmailTerm } = params;
    return this.UserModel.countDocuments(
      this.getListFilter({
        searchLoginTerm,
        searchEmailTerm,
      }),
    );
  }

  async isPersistInDb(id: string): Promise<boolean> {
    const count = await this.UserModel.countDocuments({
      _id: new ObjectId(id),
    });
    return count > 0;
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserViewDto | null> {
    const user = await this.UserModel.findOne(
      this.getListFilter({
        searchLoginTerm: loginOrEmail,
        searchEmailTerm: loginOrEmail,
        isStrictEqual: true,
      }),
    ).lean();
    if (!user) return null;
    return UserViewDto.mapToView(user);
  }

  async getByRefreshToken(refreshToken: string): Promise<UserViewDto | null> {
    const user = await this.UserModel.findOne({
      refreshTokens: refreshToken,
    }).lean();
    if (!user) return null;
    return UserViewDto.mapToView(user);
  }
}
