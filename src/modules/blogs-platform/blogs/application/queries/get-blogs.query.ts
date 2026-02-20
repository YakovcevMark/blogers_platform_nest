import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogsQueryRepository } from '../../infrastracture/query-repo';

export class GetBlogsQuery {
  constructor(public query: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<
  GetBlogsQuery,
  PaginatedViewDto<BlogViewDto[]>
> {
  constructor(private blogQueryRepo: BlogsQueryRepository) {}

  async execute({ query }: GetBlogsQuery) {
    return this.blogQueryRepo.getAll(query);
  }
}
