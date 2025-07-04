import { useState, useMemo } from "react";
import { Song } from "../types/spicetify-history";

/**
 * A hook to handle pagination logic for a list of items.
 * Calculates paginated results based on the current page and page size.
 *
 * @param items - The complete list of items to paginate (typically songs).
 * @param pageSize - The number of items per page.
 * @returns Pagination state and helpers.
 */
export const usePagination = (items: Song[], pageSize: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / pageSize);
  }, [items.length, pageSize]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    return items.slice(start, end);
  }, [items, currentPage, pageSize]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  };
};
