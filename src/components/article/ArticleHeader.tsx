
import { Bookmark, BookmarkCheck, Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ArticleHeaderProps {
  id: string;
  number?: string;
  title?: string;
  hasAudioComment?: boolean;
  isPlaying?: boolean;
  onToggleAudio?: () => void;
}

export const ArticleHeader = ({
  id,
  number,
  title,
  hasAudioComment = false,
  isPlaying = false,
  onToggleAudio
}: ArticleHeaderProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(id);

  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(id);
      toast.info("Artigo removido dos favoritos");
    } else {
      addFavorite(id);
      toast.success("Artigo adicionado aos favoritos");
    }
  };

  return (
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
                  "flex-shrink-0 transition-all duration-150 hover:scale-105", 
                  isPlaying 
                    ? "bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md" 
                    : "text-law-accent hover:text-sky-400 hover:bg-sky-950/30"
                )}
                onClick={onToggleAudio}
                aria-label={isPlaying ? "Pausar comentário" : "Ouvir comentário"}
              >
                {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? "Pausar comentário" : "Ouvir comentário"}
            </TooltipContent>
          </Tooltip>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex-shrink-0 transition-all duration-150 hover:scale-105",
                articleIsFavorite 
                  ? "text-amber-400 hover:text-amber-300 hover:bg-amber-950/30" 
                  : "text-law-accent hover:text-amber-400 hover:bg-amber-950/30"
              )}
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
  );
};

export default ArticleHeader;
