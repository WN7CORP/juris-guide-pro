
import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArticleTextNavigationProps {
  contentRef: React.RefObject<HTMLDivElement>;
  hasLongContent: boolean;
}

export const ArticleTextNavigation = ({ contentRef, hasLongContent }: ArticleTextNavigationProps) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    if (!contentRef.current || !hasLongContent) return;

    const checkScrollPosition = () => {
      const element = contentRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 10);
      setShowScrollTop(scrollTop > 200);
    };

    const element = contentRef.current;
    element.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();

    return () => element.removeEventListener('scroll', checkScrollPosition);
  }, [contentRef, hasLongContent]);

  const scrollUp = () => {
    contentRef.current?.scrollBy({ top: -150, behavior: 'smooth' });
  };

  const scrollDown = () => {
    contentRef.current?.scrollBy({ top: 150, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!hasLongContent) return null;

  return (
    <div className="absolute right-2 top-2 flex flex-col gap-1 z-10">
      {canScrollUp && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 bg-netflix-dark/90 border-gray-600 hover:bg-gray-700"
          onClick={scrollUp}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
      
      {canScrollDown && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 bg-netflix-dark/90 border-gray-600 hover:bg-gray-700"
          onClick={scrollDown}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
      
      {showScrollTop && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 bg-law-accent/90 border-law-accent hover:bg-law-accent text-white"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ArticleTextNavigation;
