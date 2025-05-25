
import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps<T = unknown> {
  totalItems?: number;
  itemsPerPage: number;
  initialPage?: number;
  items?: T[];
}

interface PaginationResult<T = unknown> {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  paginatedItems: T[];
  setPage: (page: number) => void;
}

export const usePagination = <T = unknown>({
  totalItems = 0,
  itemsPerPage: initialItemsPerPage,
  initialPage = 1,
  items = []
}: UsePaginationProps<T>): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Calculate total pages based on totalItems or items length
  const totalPages = useMemo(() => {
    const total = totalItems || items.length;
    return Math.max(1, Math.ceil(total / itemsPerPage));
  }, [totalItems, items.length, itemsPerPage]);
  
  // Calculate paginated items
  const paginatedItems = useMemo(() => {
    if (!items.length) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);
  
  // Reset to first page when items change significantly or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, totalItems, items.length]);
  
  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Page navigation functions
  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Scroll to top of the page for better UX
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const nextPage = () => {
    handlePageChange(currentPage + 1);
  };
  
  const prevPage = () => {
    handlePageChange(currentPage - 1);
  };
  
  const goToPage = (page: number) => {
    handlePageChange(page);
  };
  
  const setPage = (page: number) => {
    handlePageChange(page);
  };
  
  // Update items per page
  const updateItemsPerPage = (count: number) => {
    setItemsPerPage(count);
  };
  
  return {
    currentPage,
    totalPages,
    handlePageChange,
    nextPage,
    prevPage,
    goToPage,
    itemsPerPage,
    setItemsPerPage: updateItemsPerPage,
    paginatedItems,
    setPage
  };
};

export default usePagination;
