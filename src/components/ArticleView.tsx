
import { useState } from "react";
import { Bookmark, BookmarkCheck, Info, BookText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

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
}

interface ArticleViewProps {
  article: Article;
}

export const ArticleView = ({ article }: ArticleViewProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(article.id);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  return (
    <article className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          {article.number && (
            <h3 className="legal-article-number">Art. {article.number}</h3>
          )}
          {article.title && !article.number && (
            <h4 className="legal-article-title">{article.title}</h4>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-law-accent hover:bg-background-dark"
          onClick={toggleFavorite}
        >
          {articleIsFavorite ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
          <span className="sr-only">
            {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          </span>
        </Button>
      </div>

      <div className="legal-article-content text-sm whitespace-pre-line">
        {contentLines.map((line, index) => (
          <p key={index} className="mb-2">{line}</p>
        ))}
      </div>

      {article.items && article.items.length > 0 && (
        <div className="legal-article-section mb-4">
          {article.items.map((item, index) => (
            <p key={index} className="mb-1 text-sm">
              {item}
            </p>
          ))}
        </div>
      )}

      {article.paragraphs && article.paragraphs.length > 0 && (
        <div className="legal-article-section mb-4">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-1 text-sm italic">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {hasExplanations && (
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          <TooltipProvider>
            {article.explanation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs flex gap-1">
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">Explicação Técnica</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-background-dark">
                      <DialogHeader>
                        <DialogTitle>Explicação Técnica</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm text-gray-300 mt-2">
                        {article.explanation}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver explicação técnica</p>
                </TooltipContent>
              </Tooltip>
            )}

            {article.formalExplanation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs flex gap-1">
                        <BookText className="h-4 w-4" />
                        <span className="hidden sm:inline">Explicação Formal</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-background-dark">
                      <DialogHeader>
                        <DialogTitle>Explicação Formal</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm text-gray-300 mt-2">
                        {article.formalExplanation}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver explicação formal</p>
                </TooltipContent>
              </Tooltip>
            )}

            {article.practicalExample && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs flex gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Exemplo Prático</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-background-dark">
                      <DialogHeader>
                        <DialogTitle>Exemplo Prático</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm text-gray-300 mt-2">
                        {article.practicalExample}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver exemplo prático</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      )}
    </article>
  );
};

export default ArticleView;
