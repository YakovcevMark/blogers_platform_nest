import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { CommentsSortBy } from './comments-sort-by';
import { IsEnum, IsOptional } from 'class-validator';

export class GetCommentsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsEnum(CommentsSortBy)
  sortBy = CommentsSortBy.CreatedAt;
  @IsOptional()
  postId?: string;
}
