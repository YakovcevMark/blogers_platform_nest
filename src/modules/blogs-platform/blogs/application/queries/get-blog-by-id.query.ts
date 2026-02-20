import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastracture/query-repo';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

export class GetBlogByIdQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<
  GetBlogByIdQuery,
  BlogViewDto | null
> {
  constructor(private blogQueryRepo: BlogsQueryRepository) {}

  async execute({ blogId }: GetBlogByIdQuery) {
    return this.blogQueryRepo.getById(blogId);
  }
}
