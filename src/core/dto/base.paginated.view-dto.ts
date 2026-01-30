//базовый класс view модели для запросов за списком с пагинацией
export abstract class PaginatedViewDto<T> {
  abstract items: T;
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;

  //статический метод-утилита для мапинга
  public static mapToView<T>(data: {
    items: T;
    page: number;
    pageSize: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    const { pageSize, page, totalCount, items } = data;
    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
      items,
    };
  }
}
