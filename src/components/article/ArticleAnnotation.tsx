
import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAnnotations } from "@/hooks/useAnnotations";

interface ArticleAnnotationProps {
  articleId: string;
  articleNumber?: string;
}

export const ArticleAnnotation = ({
  articleId,
  articleNumber
}: ArticleAnnotationProps) => {
  const { getAnnotation } = useAnnotations();
  
  const annotation = getAnnotation(articleId);
  const hasAnnotation = !!annotation;

  const handleOpenAnnotations = () => {
    // Open annotations page in new tab with article ID as parameter
    const url = `/anotacoes?article=${articleId}${articleNumber ? `&number=${articleNumber}` : ''}`;
    window.open(url, '_blank');
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs flex gap-1 h-7 px-2.5 rounded-full transition-all ${
                hasAnnotation 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white border-none hover:opacity-90' 
                  : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-purple-600/20 hover:text-purple-300'
              }`}
              onClick={handleOpenAnnotations}
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
          </TooltipTrigger>
          <TooltipContent>
            {hasAnnotation ? 'Ver anotação em nova aba' : 'Criar anotação em nova aba'}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ArticleAnnotation;
