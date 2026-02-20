import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastracture/query-repo';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';

export class GetCommentByIdQuery {
  constructor(
    public commentId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<
  GetCommentByIdQuery,
  CommentViewDto | null
> {
  constructor(private commentQueryRepo: CommentsQueryRepository) {}

  async execute({ commentId, userId }: GetCommentByIdQuery) {
    return this.commentQueryRepo.getById(commentId, userId);
  }
}
