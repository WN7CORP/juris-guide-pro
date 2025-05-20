
import { useState } from "react";
import { Bookmark, BookmarkCheck, Info, X, Volume, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArticleExplanationOptions } from "@/components/ArticleExplanationOptions";
import { useAudio } from "@/contexts/AudioContext";
import AudioPlayerInline from "@/components/audio/AudioPlayerInline";

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

export const ArticleView = ({ article }: ArticleViewProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { 
    currentPlayingArticleId,
    isPlaying, 
    playAudio, 
    pauseAudio 
  } = useAudio();
  
  const articleIsFavorite = isFavorite(article.id);
  
  // State for modal dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  // Add loading state for audio
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  // Add state to control inline audio player
  const [showInlinePlayer, setShowInlinePlayer] = useState(false);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  // Check if article has audio commentary
  const hasAudioComment = article.comentario_audio && article.comentario_audio.trim() !== '';

  // Check if article has number to determine text alignment
  const hasNumber = !!article.number;
  
  // Check if this article is the one currently playing
  const isCurrentPlaying = currentPlayingArticleId === article.id;

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  const toggleAudioPlay = () => {
    if (!hasAudioComment) {
      toast.info("Comentário em áudio não disponível para este artigo");
      return;
    }

    setIsAudioLoading(true);

    if (isCurrentPlaying) {
      if (isPlaying) {
        pauseAudio();
        setIsAudioLoading(false);
      } else {
        playAudio(article.id, article.comentario_audio!)
          .catch((error) => {
            console.error("Error playing audio:", error);
            toast.error("Erro ao reproduzir comentário de áudio");
          })
          .finally(() => {
            setIsAudioLoading(false);
          });
      }
    } else {
      playAudio(article.id, article.comentario_audio!)
        .catch((error) => {
          console.error("Error playing audio:", error);
          toast.error("Erro ao reproduzir comentário de áudio");
        })
        .finally(() => {
          setIsAudioLoading(false);
        });
    }
  };

  const handleCommentClick = () => {
    if (!hasAudioComment) {
      toast.info("Comentário em áudio não disponível para este artigo");
      return;
    }
    
    // Toggle inline player
    setShowInlinePlayer(!showInlinePlayer);
    
    // If we're opening the player, also start playing
    if (!showInlinePlayer && article.comentario_audio) {
      setIsAudioLoading(true);
      playAudio(article.id, article.comentario_audio)
        .catch((error) => {
          console.error("Error playing audio:", error);
          toast.error("Erro ao reproduzir comentário de áudio");
        })
        .finally(() => {
          setIsAudioLoading(false);
        });
    }
  };

  const handleExplanationClick = (type: string) => {
    setActiveDialog(type);
  };

  // Keep the existing renderDialog function
  const renderDialog = () => {
    if (!activeDialog) return null;
    
    let title = '';
    let content = '';
    let IconComponent = Info;
    
    switch(activeDialog) {
      case 'explanation':
        title = 'Explicação Técnica';
        content = article.explanation || '';
        IconComponent = Info;
        break;
      case 'formal':
        title = 'Explicação Formal';
        content = article.formalExplanation || '';
        IconComponent = Info;
        break;
      case 'example':
        title = 'Exemplo Prático';
        content = article.practicalExample || '';
        IconComponent = Info;
        break;
      case 'comment':
        title = 'Comentário em Áudio';
        content = hasAudioComment 
          ? 'Ouça o comentário de áudio sobre este artigo.' 
          : 'Este artigo ainda não possui comentário em áudio.';
        IconComponent = Volume;
        break;
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-background-dark border border-gray-700 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <div className="sticky top-0 bg-background-dark border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-law-accent">
              <IconComponent className="h-5 w-5" />
              <h3 className="font-medium text-lg">{title}</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveDialog(null)}
              className="rounded-full p-1 h-auto w-auto hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
          <div className="p-4 text-sm text-gray-300 space-y-3">
            {activeDialog === 'comment' ? (
              hasAudioComment ? (
                <div className="flex flex-col items-center justify-center gap-4 my-4">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={isAudioLoading}
                    className={`rounded-full h-16 w-16 p-0 ${isPlaying ? 'bg-law-accent text-white' : 'bg-gray-800 text-law-accent'}`}
                    onClick={toggleAudioPlay}
                  >
                    {isAudioLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : isPlaying ? (
                      <VolumeX className="h-6 w-6" />
                    ) : (
                      <Volume className="h-6 w-6" />
                    )}
                  </Button>
                  <p className="text-center text-sm">
                    {isAudioLoading ? "Carregando..." : isPlaying ? "Reproduzindo..." : "Clique para ouvir"}
                  </p>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">Comentário em áudio não disponível para este artigo.</p>
              )
            ) : (
              content.split('\n').map((paragraph, i) => (
                <p key={i} className="leading-relaxed">{paragraph}</p>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <article 
      id={`article-${article.id}`} 
      className={cn(
        "legal-article bg-background-dark p-4 rounded-md border mb-6 transition-all hover:shadow-md relative group",
        hasAudioComment 
          ? "border-gray-600 hover:border-law-accent/50" 
          : "border-gray-800 hover:border-gray-700"
      )}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          {article.number && (
            <h3 className="legal-article-number font-serif text-lg font-bold text-law-accent mb-2">
              Art. {article.number}
              {hasAudioComment && (
                <span className="ml-2 text-xs bg-law-accent/20 text-law-accent px-1.5 py-0.5 rounded-full">
                  Comentado
                </span>
              )}
            </h3>
          )}
          {article.title && !article.number && (
            <h4 className="legal-article-title">{article.title}</h4>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-law-accent hover:bg-background-dark flex-shrink-0 transition-opacity",
              hasAudioComment ? "opacity-100" : "opacity-70 hover:opacity-100",
              isAudioLoading && "animate-pulse"
            )}
            onClick={toggleAudioPlay}
            aria-label={isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
            disabled={isAudioLoading || !hasAudioComment}
          >
            {isAudioLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isCurrentPlaying && isPlaying ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-law-accent hover:bg-background-dark flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={toggleFavorite}
            aria-label={articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {articleIsFavorite ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className={cn(
        "legal-article-content whitespace-pre-line mb-3",
        !hasNumber && "text-center bg-red-500/10 p-3 rounded",
        "font-serif text-base md:text-lg leading-relaxed"
      )}>
        {contentLines.map((line, index) => (
          <p key={index} className="mb-4 leading-relaxed">{line}</p>
        ))}
      </div>

      {article.items && article.items.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.items.map((item, index) => (
            <p key={index} className="mb-1.5 text-sm">
              {item}
            </p>
          ))}
        </div>
      )}

      {article.paragraphs && article.paragraphs.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-1.5 text-sm italic">
              {paragraph}
            </p>
          ))}
        </div>
      )}
      
      {/* Inline Audio Player - Show conditionally based on state */}
      {showInlinePlayer && hasAudioComment && (
        <AudioPlayerInline 
          articleId={article.id}
          audioUrl={article.comentario_audio!}
          title={`Comentário sobre Art. ${article.number}`}
          onClose={() => setShowInlinePlayer(false)}
        />
      )}

      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        {/* Audio comment button - Highlight when active */}
        {hasAudioComment ? (
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "text-xs flex gap-1 h-7 px-2.5 rounded-full border-gray-700 hover:border-gray-600",
              showInlinePlayer ? "bg-law-accent/20 border-law-accent/50 text-law-accent" : "bg-law-accent/10 hover:bg-law-accent/20"
            )}
            onClick={handleCommentClick}
            disabled={isAudioLoading}
          >
            {isAudioLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Volume className="h-3.5 w-3.5" />
            )}
            <span className="font-medium text-law-accent">
              {showInlinePlayer ? "Ocultar comentário" : "Comentário"}
            </span>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex gap-1 h-7 px-2.5 rounded-full border-gray-700 hover:border-gray-600 bg-gray-800/60 hover:bg-gray-700"
            onClick={() => toast.info("Comentário em áudio não disponível para este artigo")}
          >
            <Volume className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-300">Comentário</span>
          </Button>
        )}

        {hasExplanations && hasNumber && (
          <ArticleExplanationOptions
            hasTecnica={!!article.explanation}
            hasFormal={!!article.formalExplanation}
            hasExemplo={!!article.practicalExample}
            onOptionClick={handleExplanationClick}
          />
        )}
      </div>
      
      {renderDialog()}
    </article>
  );
};

export default ArticleView;
