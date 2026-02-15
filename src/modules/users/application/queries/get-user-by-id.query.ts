import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infrastructure/users.query-repo';
import { UserViewDto } from '../../api/view-dto/users.view-dto';

export class GetUserByIdQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<
  GetUserByIdQuery,
  UserViewDto | null
> {
  constructor(private usersQueryRepo: UsersQueryRepository) {}

  async execute({ userId }: GetUserByIdQuery) {
    return this.usersQueryRepo.getById(userId);
  }
}
