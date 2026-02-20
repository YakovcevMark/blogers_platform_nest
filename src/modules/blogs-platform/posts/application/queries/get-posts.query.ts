import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../infrastracture/query-repo';

export class GetPostsQuery {
  constructor(
    public query: GetPostsQueryParams,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler implements IQueryHandler<
  GetPostsQuery,
  PaginatedViewDto<PostViewDto[]>
> {
  constructor(private postQueryRepo: PostsQueryRepository) {}

  async execute({ query, userId }: GetPostsQuery) {
    return this.postQueryRepo.getAll(query, userId);
  }
}
