import { URL } from 'url';
import joi from 'joi';

export interface PagingOptions {
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  members: T[];
  totalCount: number;
  prevPage?: string;
  nextPage?: string;
}

export const pagingValidationSchema = joi.object({
  page: joi.number().min(0).required(),
  pageSize: joi.number().min(1).required(),
});

export const makePagedResult = <T>(
  array: T[],
  pagingOptions: PagingOptions,
  originalUrl: string
): PagedResult<T> => {
  const { page, pageSize } = pagingOptions;
  const pagedArray = array.slice(page * pageSize, (page + 1) * pageSize);
  let prevPage;
  let nextPage;

  const hasPrevPage = page > 0;
  const hasNextPage = page * pageSize < array.length;

  if (hasPrevPage) {
    prevPage = new URL(originalUrl);
    prevPage.searchParams.delete('page');
    prevPage.searchParams.append('page', (page - 1).toString());
  }

  if (hasNextPage) {
    nextPage = new URL(originalUrl);
    nextPage.searchParams.delete('page');
    nextPage.searchParams.append('page', (page + 1).toString());
  }

  return {
    members: pagedArray,
    totalCount: array.length,
    prevPage: prevPage?.toString(),
    nextPage: nextPage?.toString(),
  };
};
