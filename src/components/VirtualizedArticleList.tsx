
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { LegalArticle } from "@/services/legalCodeService";
import ArticleView from "@/components/ArticleView";
import { debounce } from 'lodash';

interface VirtualizedArticleListProps {
  articles: LegalArticle[];
  selectedArticleId?: string;
}

const VirtualizedArticleList = ({ articles, selectedArticleId }: VirtualizedArticleListProps) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [averageItemHeight, setAverageItemHeight] = useState(200); // Initial estimate
  const bufferSize = 5; // Number of items to render beyond the visible area
  const heightMeasurementRef = useRef<{ [key: string]: number }>({});
  
  // Calculate the average height of rendered articles for better virtualization
  const updateAverageItemHeight = useCallback(() => {
    const heights = Object.values(heightMeasurementRef.current);
    if (heights.length > 0) {
      const newAverage = heights.reduce((sum, height) => sum + height, 0) / heights.length;
      setAverageItemHeight(Math.max(newAverage, 100)); // Ensure minimum height
    }
  }, []);
  
  // Measure the height of an article element
  const measureHeight = useCallback((id: string, height: number) => {
    if (!heightMeasurementRef.current[id] || heightMeasurementRef.current[id] !== height) {
      heightMeasurementRef.current[id] = height;
      updateAverageItemHeight();
    }
  }, [updateAverageItemHeight]);
  
  // Update visible range based on scroll position
  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const viewportTop = containerTop;
    const viewportBottom = containerTop + containerHeight;
    
    // Use average height for better estimation of start/end indices
    const estimatedStartIndex = Math.max(0, Math.floor(viewportTop / averageItemHeight) - bufferSize);
    const estimatedEndIndex = Math.min(
      articles.length - 1,
      Math.ceil(viewportBottom / averageItemHeight) + bufferSize
    );
    
    setVisibleRange({ start: estimatedStartIndex, end: estimatedEndIndex });
  }, [articles.length, averageItemHeight, bufferSize]);
  
  // Debounce the update function to avoid excessive re-renders
  const debouncedUpdateVisibleRange = useMemo(
    () => debounce(updateVisibleRange, 100),
    [updateVisibleRange]
  );
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // If there's a selected article, make sure it's in view
    if (selectedArticleId) {
      const selectedIndex = articles.findIndex(a => a.id?.toString() === selectedArticleId);
      if (selectedIndex >= 0) {
        const start = Math.max(0, selectedIndex - bufferSize);
        const end = Math.min(articles.length - 1, selectedIndex + bufferSize * 2);
        setVisibleRange({ start, end });
        
        // Scroll to the selected article smoothly
        requestAnimationFrame(() => {
          const element = document.getElementById(`article-${selectedArticleId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    }
    
    const container = containerRef.current;
    container.addEventListener("scroll", debouncedUpdateVisibleRange);
    window.addEventListener("resize", debouncedUpdateVisibleRange);
    
    // Initial update
    updateVisibleRange();
    
    return () => {
      container.removeEventListener("scroll", debouncedUpdateVisibleRange);
      window.removeEventListener("resize", debouncedUpdateVisibleRange);
      debouncedUpdateVisibleRange.cancel();
    };
  }, [articles, selectedArticleId, bufferSize, debouncedUpdateVisibleRange, updateVisibleRange]);
  
  // Get only the articles that should be visible
  const visibleArticles = articles.slice(visibleRange.start, visibleRange.end + 1);
  
  // Create spacers for content above and below the visible items
  const topSpacerHeight = visibleRange.start * averageItemHeight;
  const bottomArticlesCount = articles.length - visibleRange.end - 1;
  const bottomSpacerHeight = bottomArticlesCount * averageItemHeight;
  
  return (
    <div 
      ref={containerRef} 
      className="overflow-y-auto h-full flex flex-col"
      style={{ height: "calc(100vh - 300px)", minHeight: "400px" }}
    >
      {/* Top spacer */}
      {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px` }} />}
      
      {/* Visible articles */}
      {visibleArticles.map(article => (
        <ArticleResizeObserver
          key={article.id?.toString() || `article-${Math.random()}`}
          article={article}
          selectedArticleId={selectedArticleId}
          onResize={(height) => measureHeight(article.id!.toString(), height)}
        />
      ))}
      
      {/* Bottom spacer */}
      {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} />}
      
      {/* No results message */}
      {articles.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Nenhum artigo encontrado</p>
        </div>
      )}
    </div>
  );
};

// Component to observe and measure article height
const ArticleResizeObserver = ({ 
  article, 
  selectedArticleId,
  onResize 
}: { 
  article: LegalArticle, 
  selectedArticleId?: string,
  onResize: (height: number) => void 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    // Create ResizeObserver to measure element height
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          onResize(height);
        }
      }
    });
    
    resizeObserver.observe(ref.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [onResize]);
  
  return (
    <div ref={ref}>
      <ArticleView 
        article={{
          id: article.id?.toString() || '',
          number: article.numero || "",
          content: article.artigo,
          explanation: article.tecnica,
          formalExplanation: article.formal,
          practicalExample: article.exemplo,
          comentario_audio: article.comentario_audio
        }} 
      />
    </div>
  );
};

export default VirtualizedArticleList;
