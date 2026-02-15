import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infrastructure/users.query-repo';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';

export class GetUsersQuery {
  constructor(public query: GetUsersQueryParams) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<
  GetUsersQuery,
  PaginatedViewDto<UserViewDto[]>
> {
  constructor(private usersQueryRepo: UsersQueryRepository) {}

  async execute({ query }: GetUsersQuery) {
    return this.usersQueryRepo.getAll(query);
  }
}
