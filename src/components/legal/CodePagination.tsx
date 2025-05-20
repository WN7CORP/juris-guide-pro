
import { useState } from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface CodePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const CodePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange
}: CodePaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Calculate page numbers to show
  const showPages = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // If we have 7 or fewer pages, show all of them
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always show first page
    pages.push(1);
    
    // Calculate start and end of middle section
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(2, endPage - (maxPagesToShow - 1));
    }
    
    // Add ellipsis if needed before middle section
    if (startPage > 2) {
      pages.push(-1); // -1 represents ellipsis
    } else if (startPage === 2) {
      pages.push(2);
    }
    
    // Add middle section
    for (let i = Math.max(3, startPage); i <= Math.min(totalPages - 2, endPage); i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed after middle section
    if (endPage < totalPages - 2) {
      pages.push(-2); // -2 represents the second ellipsis
    } else if (endPage === totalPages - 2) {
      pages.push(totalPages - 1);
    }
    
    // Always show last page
    pages.push(totalPages);
    
    return pages;
  };
  
  const pages = showPages();
  
  return (
    <Pagination className="my-6">
      <PaginationContent>
        {currentPage !== 1 && (
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
        
        {pages.map((page, index) => {
          // Render ellipsis
          if (page < 0) {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          
          // Render page number
          return (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        {currentPage !== totalPages && (
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default CodePagination;
