
import { useEffect, useRef, useState } from "react";
import { LegalArticle } from "@/services/legalCodeService";
import ArticleView from "@/components/ArticleView";

interface VirtualizedArticleListProps {
  articles: LegalArticle[];
  selectedArticleId?: string;
}

const VirtualizedArticleList = ({ articles, selectedArticleId }: VirtualizedArticleListProps) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 200; // Estimated average height of an article component
  const bufferSize = 5; // Number of items to render beyond the visible area
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateVisibleRange = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const viewportTop = containerTop;
      const viewportBottom = containerTop + containerHeight;
      
      const startIndex = Math.max(0, Math.floor(viewportTop / itemHeight) - bufferSize);
      const endIndex = Math.min(
        articles.length - 1,
        Math.ceil(viewportBottom / itemHeight) + bufferSize
      );
      
      setVisibleRange({ start: startIndex, end: endIndex });
    };
    
    // If there's a selected article, make sure it's in view
    if (selectedArticleId) {
      const selectedIndex = articles.findIndex(a => a.id?.toString() === selectedArticleId);
      if (selectedIndex >= 0) {
        const start = Math.max(0, selectedIndex - bufferSize);
        const end = Math.min(articles.length - 1, selectedIndex + bufferSize * 2);
        setVisibleRange({ start, end });
        
        // Scroll to the selected article
        requestAnimationFrame(() => {
          const element = document.getElementById(`article-${selectedArticleId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    }
    
    const container = containerRef.current;
    container.addEventListener("scroll", updateVisibleRange);
    window.addEventListener("resize", updateVisibleRange);
    
    updateVisibleRange();
    
    return () => {
      container.removeEventListener("scroll", updateVisibleRange);
      window.addEventListener("resize", updateVisibleRange);
    };
  }, [articles, selectedArticleId]);
  
  const visibleArticles = articles.slice(visibleRange.start, visibleRange.end + 1);
  
  // Create spacers for content above and below the visible items
  const topSpacerHeight = visibleRange.start * itemHeight;
  const bottomSpacerHeight = (articles.length - visibleRange.end - 1) * itemHeight;
  
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
        <ArticleView 
          key={article.id?.toString() || `article-${Math.random()}`} 
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
      ))}
      
      {/* Bottom spacer */}
      {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} />}
    </div>
  );
};

export default VirtualizedArticleList;
