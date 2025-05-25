
import { useState } from "react";
import { StickyNote, BookOpen, Scale, Volume, Heart, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFavoritesStore } from "@/store/favoritesStore";
import { toast } from "sonner";
import ArticleAnnotation from "@/components/annotation/ArticleAnnotation";
import { useAnnotations } from "@/hooks/useAnnotations";

interface ArticleFooterProps {
  id: string;
  hasAudioComment: boolean;
  isPlaying: boolean;
  onToggleAudio: () => void;
  hasExplanations: boolean;
  hasNumber: boolean;
  articleNumber?: string;
  hasExplanation: boolean;
  hasFormalExplanation: boolean;
  hasPracticalExample: boolean;
  onOpenExplanation: () => void;
  onOpenFormal: () => void;
  onOpenExample: () => void;
}

const ArticleFooter = ({
  id,
  hasAudioComment,
  isPlaying,
  onToggleAudio,
  hasExplanations,
  hasNumber,
  articleNumber,
  hasExplanation,
  hasFormalExplanation,
  hasPracticalExample,
  onOpenExplanation,
  onOpenFormal,
  onOpenExample
}: ArticleFooterProps) => {
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const isFavorited = favorites.includes(id);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const { getAnnotation, saveAnnotation } = useAnnotations();

  const handleFavoriteToggle = () => {
    if (isFavorited) {
      removeFavorite(id);
      toast.success("Removido dos favoritos");
    } else {
      addFavorite(id);
      toast.success("Adicionado aos favoritos");
    }
  };

  const currentAnnotation = getAnnotation(id);

  const handleSaveAnnotation = (content: string) => {
    saveAnnotation(id, content);
    setShowAnnotation(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Button */}
          {hasAudioComment && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleAudio}
                  className={`text-xs flex gap-1 h-7 px-2.5 rounded-full ${
                    isPlaying 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-none' 
                      : 'bg-green-950/20 border-green-700 text-green-400 hover:bg-green-900/30'
                  }`}
                >
                  <Volume className="h-3.5 w-3.5" />
                  <span>{isPlaying ? 'Pausar' : 'Áudio'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? 'Pausar comentário em áudio' : 'Reproduzir comentário em áudio'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Explanations Buttons */}
          {hasExplanation && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenExplanation}
                  className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-blue-950/20 border-blue-700 text-blue-400 hover:bg-blue-900/30"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Explicação</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Ver explicação didática
              </TooltipContent>
            </Tooltip>
          )}

          {hasFormalExplanation && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenFormal}
                  className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-purple-950/20 border-purple-700 text-purple-400 hover:bg-purple-900/30"
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>Formal</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Ver explicação formal/técnica
              </TooltipContent>
            </Tooltip>
          )}

          {hasPracticalExample && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenExample}
                  className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-amber-950/20 border-amber-700 text-amber-400 hover:bg-amber-900/30"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Exemplo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Ver exemplo prático
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Annotations Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentAnnotation ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAnnotation(true)}
                className={`text-xs flex gap-1 h-7 px-2.5 rounded-full ${
                  currentAnnotation
                    ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-none hover:opacity-90'
                    : 'bg-violet-950/20 border-violet-700 text-violet-400 hover:bg-violet-900/30'
                }`}
              >
                <StickyNote className="h-3.5 w-3.5" />
                <span>Anotações</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {currentAnnotation ? 'Editar anotação existente' : 'Adicionar anotação'}
            </TooltipContent>
          </Tooltip>

          {/* Favorite Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isFavorited ? "default" : "outline"}
                size="sm"
                onClick={handleFavoriteToggle}
                className={`text-xs flex gap-1 h-7 px-2.5 rounded-full ${
                  isFavorited 
                    ? 'bg-netflix-red hover:bg-red-700 text-white border-none' 
                    : 'bg-red-950/20 border-red-700 text-red-400 hover:bg-red-900/30'
                }`}
              >
                {isFavorited ? (
                  <BookmarkCheck className="h-3.5 w-3.5" />
                ) : (
                  <Heart className="h-3.5 w-3.5" />
                )}
                <span>{isFavorited ? 'Favoritado' : 'Favoritar'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Annotation Component */}
      {showAnnotation && (
        <div className="mt-4">
          <ArticleAnnotation
            articleId={id}
            articleNumber={articleNumber}
            initialContent={currentAnnotation?.content || ''}
            onSave={handleSaveAnnotation}
            onClose={() => setShowAnnotation(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleFooter;
