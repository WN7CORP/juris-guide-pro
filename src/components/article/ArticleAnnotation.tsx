
import { useState } from "react";
import { StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnnotationPanel } from "./AnnotationPanel";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticleAnnotationProps {
  articleId: string;
  articleNumber?: string;
}

export const ArticleAnnotation = ({ articleId, articleNumber }: ArticleAnnotationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-orange-400 hover:bg-orange-900/20 flex-shrink-0 transition-all duration-200 hover:scale-110 h-9 w-9" 
              onClick={handleToggle}
              aria-label="Adicionar anotação"
            >
              <StickyNote className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Adicionar anotação
          </TooltipContent>
        </Tooltip>

        {/* Annotation Panel - Full screen on mobile, sidebar on desktop */}
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />
            )}
            
            {/* Panel */}
            <div className={`
              fixed z-50 bg-netflix-bg border-l border-gray-700 shadow-2xl
              ${isMobile 
                ? 'inset-0 animate-slide-in-right' 
                : 'top-0 right-0 h-full w-96 animate-slide-in-right'
              }
            `}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-orange-400" />
                  Anotações
                  {articleNumber && (
                    <span className="text-sm text-gray-400">
                      - Art. {articleNumber}
                    </span>
                  )}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <AnnotationPanel 
                  articleId={articleId} 
                  articleNumber={articleNumber}
                  onClose={() => setIsOpen(false)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ArticleAnnotation;
