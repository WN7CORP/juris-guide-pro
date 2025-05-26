
import { useState, useRef, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import AprofundarButton from "@/components/AprofundarButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  items?: string[];
  paragraphs?: string[];
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  comentario_audio?: string;
}
interface ArticleViewProps {
  article: Article;
}

export const ArticleView = ({
  article
}: ArticleViewProps) => {
  const {
    isFavorite,
    addFavorite,
    removeFavorite
  } = useFavoritesStore();
  const navigate = useNavigate();
  
  const articleIsFavorite = isFavorite(article.id);

  // State for modal dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  // Check if article has number to determine text alignment
  const hasNumber = !!article.number;
  
  const handleExplanationDialog = (type: string) => {
    setActiveDialog(type);
  };
  
  return <TooltipProvider>
      <article className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700 relative">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div>
            {article.number && <h3 className="legal-article-number font-serif text-lg font-bold text-law-accent">
                Art. {article.number}
              </h3>}
            {article.title && !article.number && <h4 className="legal-article-title">{article.title}</h4>}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-law-accent hover:bg-background-dark flex-shrink-0" onClick={toggleFavorite} aria-label={articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                  {articleIsFavorite ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        
        <div className={cn("legal-article-content whitespace-pre-line mb-3", !hasNumber && "text-center bg-red-500/10 p-3 rounded")}>
          {contentLines.map((line, index) => <p key={index} className="mb-4">{line}</p>)}
        </div>

        
        {article.items && article.items.length > 0 && <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
            {article.items.map((item, index) => <p key={index} className="mb-3 text-sm">
                {item}
              </p>)}
          </div>}

        {article.paragraphs && article.paragraphs.length > 0 && <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
            {article.paragraphs.map((paragraph, index) => <p key={index} className="mb-3 text-sm italic">
                {paragraph}
              </p>)}
          </div>}

        
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          {hasExplanations && hasNumber && (
            <AprofundarButton 
              hasTecnica={!!article.explanation}
              hasFormal={!!article.formalExplanation}
              hasExemplo={!!article.practicalExample}
              onSelectTecnica={() => handleExplanationDialog('explanation')}
              onSelectFormal={() => handleExplanationDialog('formal')}
              onSelectExemplo={() => handleExplanationDialog('example')}
            />
          )}
        </div>
        
        
        <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {activeDialog === 'explanation' && "Explicação Técnica"}
                {activeDialog === 'formal' && "Explicação Formal"}
                {activeDialog === 'example' && "Exemplo Prático"}
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-gray-300 space-y-3 max-h-[60vh] overflow-y-auto">
              {activeDialog === 'explanation' && article.explanation && 
                article.explanation.split('\n').map((paragraph, i) => (
                  <p key={i} className="leading-relaxed">{paragraph}</p>
                ))}
              
              {activeDialog === 'formal' && article.formalExplanation && 
                article.formalExplanation.split('\n').map((paragraph, i) => (
                  <p key={i} className="leading-relaxed">{paragraph}</p>
                ))}
              
              {activeDialog === 'example' && article.practicalExample && 
                article.practicalExample.split('\n').map((paragraph, i) => (
                  <p key={i} className="leading-relaxed">{paragraph}</p>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </article>
    </TooltipProvider>;
};

export default ArticleView;
