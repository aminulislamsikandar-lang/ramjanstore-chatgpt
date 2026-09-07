export interface PaginationInput { page: number; limit: number; }

export function parsePagination(pageValue: unknown, limitValue: unknown): PaginationInput {
  const page = Math.max(1, Number(pageValue) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitValue) || 20));
  return { page: Math.floor(page), limit: Math.floor(limit) };
}

export function offsetFor({ page, limit }: PaginationInput): number {
  return (page - 1) * limit;
}
