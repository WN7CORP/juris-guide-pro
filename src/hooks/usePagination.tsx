
import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage: number;
  initialPage?: number;
}

interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
}

export const usePagination = <T,>({
  items,
  itemsPerPage: initialItemsPerPage,
  initialPage = 1
}: UsePaginationProps<T>): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Reset to first page when items change significantly or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, items.length]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);
  
  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Get current items for the page
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);
  
  // Page navigation functions
  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Scroll to top of the page for better UX
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const nextPage = () => {
    setPage(currentPage + 1);
  };
  
  const prevPage = () => {
    setPage(currentPage - 1);
  };
  
  const goToPage = (page: number) => {
    setPage(page);
  };
  
  // Update items per page
  const updateItemsPerPage = (count: number) => {
    setItemsPerPage(count);
  };
  
  return {
    currentPage,
    totalPages,
    paginatedItems,
    setPage,
    nextPage,
    prevPage,
    goToPage,
    itemsPerPage,
    setItemsPerPage: updateItemsPerPage
  };
};

export default usePagination;
