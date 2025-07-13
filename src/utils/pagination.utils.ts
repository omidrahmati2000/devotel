import type { Request } from 'express';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  statusCode: string;
  data: T[];
  count: number;
  currentPage: string;
  nextPage: string | null;
  prevPage: string | null;
  lastPage: string;
}

export function paginateResource<T>(
  data: [T[], number],
  query: PaginationQuery,
  req: Request,
): PaginatedResult<T> {
  const page = parseInt(String(query.page || 1));
  const limit = parseInt(String(query.limit || 20));
  const url = req.url;
  const [result, total] = data;
  const lastPageNum = Math.ceil(total / limit);
  const nextPageNum = page + 1 > lastPageNum ? null : page + 1;
  const prevPageNum = page - 1 < 1 ? null : page - 1;

  const baseUrl = url.split('?')[0];
  const queryParams = new URLSearchParams(req.query as any);

  const buildPageUrl = (pageNum: number | null) => {
    if (pageNum === null) return null;
    const params = new URLSearchParams(queryParams);
    params.set('page', String(pageNum));
    params.set('limit', String(limit));
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    statusCode: 'success',
    data: [...result],
    count: total,
    currentPage: url,
    nextPage: buildPageUrl(nextPageNum),
    prevPage: buildPageUrl(prevPageNum),
    lastPage: buildPageUrl(lastPageNum),
  };
}
