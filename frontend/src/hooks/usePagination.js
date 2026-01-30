import { useState, useMemo } from 'react';

export default function usePagination(data, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}