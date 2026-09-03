import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], perPage = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * perPage, safePage * perPage),
    [items, safePage, perPage],
  );

  return {
    page: safePage,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    setPage,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToPage: (n: number) => setPage(Math.max(1, Math.min(n, totalPages))),
  };
}
