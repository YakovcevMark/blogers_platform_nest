import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CommentsQueryRepository } from '../../infrastracture/query-repo';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from '../../../posts/infrastracture/query-repo';

export class GetCommentsQuery {
  constructor(
    public postId: string,
    public query: GetCommentsQueryParams,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentsQuery)
export class GetCommentsQueryHandler implements IQueryHandler<
  GetCommentsQuery,
  PaginatedViewDto<CommentViewDto[]>
> {
  constructor(
    private commentQueryRepo: CommentsQueryRepository,
    private postQueryRepo: PostsQueryRepository,
  ) {}

  async execute({ query, userId, postId }: GetCommentsQuery) {
    const post = await this.postQueryRepo.getById(postId);
    if (!post) throw new NotFoundException('Post not found');
    query.postId = post.id;
    return this.commentQueryRepo.getAll(query, userId);
  }
}
