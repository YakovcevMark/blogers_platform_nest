import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';
import { IsEnum, IsOptional } from 'class-validator';

export class GetPostsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsEnum(PostsSortBy)
  sortBy = PostsSortBy.CreatedAt;
  @IsOptional()
  blogId: string | null = null;
}
