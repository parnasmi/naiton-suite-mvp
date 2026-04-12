import { PaginationSchema } from "@naiton/contracts";

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const paginate = <T>(items: T[], page: number, pageSize: number): PaginatedResult<T> => {
  const total = items.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.ceil(total / safePageSize);
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    pagination: PaginationSchema.parse({
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages
    })
  };
};
