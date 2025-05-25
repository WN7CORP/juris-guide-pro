
import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAnnotations } from "@/hooks/useAnnotations";
import AnnotationDashboard from "@/components/annotation/AnnotationDashboard";

interface ArticleAnnotationProps {
  articleId: string;
  articleNumber?: string;
}

export const ArticleAnnotation = ({
  articleId,
  articleNumber
}: ArticleAnnotationProps) => {
  const { getAnnotation } = useAnnotations();
  const [isOpen, setIsOpen] = useState(false);
  
  const annotation = getAnnotation(articleId);
  const hasAnnotation = !!annotation;

  return (
    <TooltipProvider>
      <div className="relative">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`text-xs flex gap-1 h-7 px-2.5 rounded-full transition-all ${
                    hasAnnotation 
                      ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white border-none hover:opacity-90' 
                      : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-purple-600/20 hover:text-purple-300'
                  }`}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  <span>Anotações</span>
                  {hasAnnotation && (
                    <div 
                      className="w-2 h-2 rounded-full ml-1" 
                      style={{ backgroundColor: annotation.color }}
                    />
                  )}
                </Button>
              </SheetTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {hasAnnotation ? 'Ver anotação' : 'Criar anotação'}
            </TooltipContent>
          </Tooltip>
          
          <SheetContent side="right" className="w-full sm:w-[800px] bg-netflix-bg border-gray-800 overflow-y-auto">
            <SheetHeader className="border-b border-gray-800 pb-4">
              <SheetTitle className="text-purple-400">
                Anotações
                {articleNumber && (
                  <span className="text-gray-400 ml-2">
                    - Art. {articleNumber}
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-6">
              <AnnotationDashboard highlightArticleId={articleId} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
};

export default ArticleAnnotation;
