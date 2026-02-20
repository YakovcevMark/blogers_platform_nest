import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastracture/query-repo';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

export class GetPostByIdQuery {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  PostViewDto | null
> {
  constructor(private postQueryRepo: PostsQueryRepository) {}

  async execute({ postId, userId }: GetPostByIdQuery) {
    return this.postQueryRepo.getById(postId, userId);
  }
}
