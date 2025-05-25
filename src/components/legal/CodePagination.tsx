
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const CodePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}: CodePaginationProps) => {
  const isMobile = useIsMobile();
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Calculate page numbers to show based on device
  const showPages = () => {
    const pages = [];
    const maxPagesToShow = isMobile ? 3 : 5;
    
    // If we have 7 or fewer pages, show all of them
    if (totalPages <= (isMobile ? 5 : 7)) {
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
    <Pagination className="my-6 overflow-x-auto max-w-full pb-1">
      <PaginationContent className={isMobile ? "gap-0.5" : "gap-1"}>
        {currentPage !== 1 && (
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className="cursor-pointer"
              size={isMobile ? "icon" : "default"}
            >
              {!isMobile && "Previous"}
            </PaginationPrevious>
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
                className={`cursor-pointer ${isMobile ? "w-8 h-8 p-0" : ""}`}
                size={isMobile ? "icon" : "default"}
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
              size={isMobile ? "icon" : "default"}
            >
              {!isMobile && "Next"}
            </PaginationNext>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default CodePagination;
