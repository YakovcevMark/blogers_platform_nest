type Filter<T> = {
  fieldName: keyof T;
  queryParam?: string | null;
  isStrictEqual?: boolean;
};
export const getDbFilters = <T>(filters: Filter<T>[]) => {
  const output: Record<
    string,
    { $regex: string; $options: string } | string
  >[] = [];

  for (const filter of filters) {
    const { fieldName, queryParam, isStrictEqual = false } = filter;

    if (queryParam) {
      const obj: Record<string, { $regex: string; $options: string } | string> =
        {};

      if (isStrictEqual) {
        obj[fieldName.toString()] = queryParam;
      } else {
        obj[fieldName.toString()] = {
          $regex: queryParam,
          $options: 'i',
        };
      }
      output.push(obj);
    }
  }

  return output.length ? { $or: output } : {};
};
