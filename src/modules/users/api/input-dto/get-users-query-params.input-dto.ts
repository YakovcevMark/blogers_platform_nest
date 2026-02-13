//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { UsersSortBy } from './users-sort-by';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsOptional } from 'class-validator';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetUsersQueryParams extends BaseQueryParams {
  @IsOptional()
  sortBy = UsersSortBy.CreatedAt;
  @IsOptional()
  searchLoginTerm: string | null = null;
  @IsOptional()
  searchEmailTerm: string | null = null;
}
