
import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

interface PaginationResult {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
}

export const usePagination = ({
  totalItems,
  itemsPerPage: initialItemsPerPage,
  initialPage = 1
}: UsePaginationProps): PaginationResult => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Reset to first page when items change significantly or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, totalItems]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);
  
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
    setItemsPerPage: updateItemsPerPage
  };
};

export default usePagination;
