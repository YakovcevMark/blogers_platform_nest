import { BaseQueryParams } from '../dto/base.query-params.input-dto';

export const getSkipDbValue = (props: BaseQueryParams) =>
  (props.pageNumber - 1) * props.pageSize;
