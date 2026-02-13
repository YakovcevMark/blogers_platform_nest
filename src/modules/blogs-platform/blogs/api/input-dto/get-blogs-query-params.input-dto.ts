//dto для запроса списка блогов с пагинацией, сортировкой, фильтрами
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';
import { IsEnum, IsOptional } from 'class-validator';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetBlogsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsEnum(BlogsSortBy)
  sortBy = BlogsSortBy.CreatedAt;
  @IsOptional()
  searchNameTerm: string | null = null;
}
