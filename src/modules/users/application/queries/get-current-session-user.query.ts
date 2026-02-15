import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../infrastructure/users.query-repo';

export class GetCurrentSessionUserQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetCurrentSessionUserQuery)
export class GetCurrentSessionUserQueryHandler implements IQueryHandler<GetCurrentSessionUserQuery> {
  constructor(private usersQueryRepo: UsersQueryRepository) {}

  async execute({ userId }: GetCurrentSessionUserQuery) {
    return this.usersQueryRepo.getCurrentSessionUser(userId);
  }
}
