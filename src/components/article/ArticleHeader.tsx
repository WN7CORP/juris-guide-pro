import { useState } from "react";
import { Bookmark, BookmarkCheck, Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { toast } from "sonner";

interface ArticleHeaderProps {
  id: string;
  number?: string;
  title?: string;
  hasAudioComment: boolean;
  isPlaying: boolean;
  onToggleAudio: () => void;
}

export const ArticleHeader = ({
  id,
  number,
  title,
  hasAudioComment,
  isPlaying,
  onToggleAudio
}: ArticleHeaderProps) => {
  const { isFavorite, toggleFavorite, normalizeId } = useFavoritesStore();
  const articleIsFavorite = isFavorite(id);

  const handleToggleFavorite = () => {
    toggleFavorite(id, number);
  };
  
  return (
    <TooltipProvider>
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
                  onClick={onToggleAudio}
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
                className="text-law-accent hover:bg-background-dark flex-shrink-0 transition-all duration-200 hover:scale-110" 
                onClick={handleToggleFavorite} 
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
    </TooltipProvider>
  );
};

export default ArticleHeader;
