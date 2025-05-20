
import React from "react";
import { Bookmark, BookmarkCheck, Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface ArticleCardProps {
  id: string;
  title: string;
  number?: string;
  content: string;
  hasAudioComment?: boolean;
  isPlaying?: boolean;
  onAudioToggle?: () => void;
  codeId?: string;
}

export const ArticleCard = ({
  id,
  title,
  number,
  content,
  hasAudioComment = false,
  isPlaying = false,
  onAudioToggle,
  codeId
}: ArticleCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(id);

  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  // Split content by line breaks to respect original formatting
  const contentLines = content.split('\n').filter(line => line.trim() !== '');
  
  // Create link to article in its code
  const articleLink = codeId ? `/codigos/${codeId}?article=${id}` : null;

  return (
    <TooltipProvider>
      <article className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700 relative">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div>
            {number && (
              <h3 className="legal-article-number font-serif text-lg font-bold text-law-accent">
                Art. {number}
              </h3>
            )}
            {title && !number && <h4 className="legal-article-title">{title}</h4>}
          </div>
          <div className="flex items-center gap-2">
            {hasAudioComment && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isPlaying ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex-shrink-0", 
                      isPlaying ? "bg-law-accent text-white" : "text-law-accent hover:bg-background-dark"
                    )}
                    onClick={onAudioToggle}
                    aria-label={isPlaying ? "Pausar comentário em áudio" : "Ouvir comentário em áudio"}
                  >
                    {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-law-accent hover:bg-background-dark flex-shrink-0" 
                  onClick={toggleFavorite} 
                  aria-label={articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  {articleIsFavorite ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className={cn("legal-article-content whitespace-pre-line mb-3", !number && "text-center bg-red-500/10 p-3 rounded")}>
          {contentLines.map((line, index) => (
            <p key={index} className="mb-2.5 leading-relaxed">{line}</p>
          ))}
        </div>

        {articleLink && (
          <div className="mt-4 text-right">
            <Link 
              to={articleLink} 
              className="text-xs text-law-accent hover:underline inline-flex items-center gap-1"
            >
              Ver artigo completo
            </Link>
          </div>
        )}
      </article>
    </TooltipProvider>
  );
};

export default ArticleCard;
