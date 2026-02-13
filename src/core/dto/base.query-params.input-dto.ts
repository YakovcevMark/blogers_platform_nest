import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
  //для трансформации в number
  @IsOptional()
  @Type(() => Number)
  pageNumber: number = 1;
  @IsOptional()
  @Type(() => Number)
  pageSize: number = 10;
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}
