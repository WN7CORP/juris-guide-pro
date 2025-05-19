
import { useState, useRef, useEffect } from "react";
import { Bookmark, BookmarkCheck, Info, X, Volume, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArticleExplanationOptions } from "@/components/ArticleExplanationOptions";

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
  const articleIsFavorite = isFavorite(article.id);
  
  // State for modal dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
      toast.success("Removido dos favoritos");
    } else {
      addFavorite(article.id);
      toast.success("Adicionado aos favoritos");
    }
  };

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  // Check if article has audio commentary
  const hasAudioComment = article.comentario_audio && article.comentario_audio.trim() !== '';

  // Check if article has number to determine text alignment
  const hasNumber = !!article.number;

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  const trackProgress = () => {
    if (!audioRef.current) return;
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Set up new progress tracking
    const intervalId = window.setInterval(() => {
      if (audioRef.current) {
        const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(percentage);
      }
    }, 100);
    
    progressIntervalRef.current = intervalId;
  };

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(0);
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) {
      console.error("Audio reference is not available");
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      if (hasAudioComment) {
        setAudioLoading(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setAudioLoading(false);
            trackProgress();
            
            // Dispatch custom event for now playing
            const event = new CustomEvent('nowPlaying', { 
              detail: { 
                articleId: article.id, 
                articleNumber: article.number || '',
                audioUrl: article.comentario_audio
              } 
            });
            document.dispatchEvent(event);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            setAudioError(`Erro ao reproduzir áudio: ${error.message}`);
            setAudioLoading(false);
            toast.error("Não foi possível reproduzir o áudio");
          });
      } else {
        toast.info("Comentário em áudio em breve disponível");
      }
    }
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
    setAudioLoading(false);
    trackProgress();
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    clearProgressInterval();
    
    // Dispatch custom event for audio ended
    const event = new CustomEvent('audioEnded', { detail: { articleId: article.id } });
    document.dispatchEvent(event);
  };

  const handleAudioCanPlay = () => {
    setAudioLoaded(true);
    setAudioLoading(false);
    setDuration(audioRef.current?.duration || 0);
  };

  const handleAudioError = (e: any) => {
    const errorMessage = e.target.error 
      ? `Code: ${e.target.error.code}, Message: ${e.target.error.message}` 
      : "Unknown error";
    console.error("Audio error:", errorMessage);
    setAudioError(errorMessage);
    setIsPlaying(false);
    setAudioLoading(false);
    toast.error("Não foi possível reproduzir o áudio do comentário");
  };

  const handleExplanationClick = (type: string) => {
    setActiveDialog(type);
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        content = '';
        IconComponent = Volume;
        break;
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-gradient-to-b from-gray-900 to-black border border-gray-700 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-netflix-red">
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
              <div className="modern-audio-player flex flex-col items-center gap-4 my-4">
                <Button
                  variant="outline"
                  size="lg"
                  className={`rounded-full h-16 w-16 p-0 ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-netflix-red to-red-700 text-white animate-glow' 
                      : 'bg-gray-800 text-netflix-red'
                  }`}
                  onClick={toggleAudioPlay}
                  disabled={audioLoading}
                >
                  {audioLoading ? (
                    <div className="h-5 w-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                
                <div className="w-full">
                  {audioRef.current && (
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{formatTime(audioRef.current.currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  )}
                  <div className="audio-progress-bar">
                    <div className="audio-progress-fill" style={{width: `${progress}%`}}></div>
                  </div>
                </div>
                
                <p className="text-center text-sm mt-2">
                  {audioLoading ? "Carregando áudio..." : isPlaying ? "Reproduzindo..." : "Clique para ouvir"}
                </p>
                
                {audioError && (
                  <div className="text-red-500 text-xs p-2 bg-red-900/20 rounded">
                    {audioError}
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Volume className="h-3 w-3" />
                  <span>Artigo {article.number}</span>
                </div>
              </div>
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

  useEffect(() => {
    // Cleanup function
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', handleAudioPlay);
        audioRef.current.removeEventListener('pause', handleAudioPause);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.removeEventListener('canplay', handleAudioCanPlay);
      }
    };
  }, []);
  
  // Listen for global play/pause events to sync audio players
  useEffect(() => {
    const handleGlobalPlay = (e: CustomEvent) => {
      const detail = e.detail as { articleId: string, audioUrl: string };
      
      // If this is the current article, do nothing
      if (detail.articleId === article.id) return;
      
      // If another article is playing, pause this one
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        clearProgressInterval();
      }
    };
    
    // Use type assertion for the event listener
    document.addEventListener('nowPlaying', handleGlobalPlay as EventListener);
    
    return () => {
      document.removeEventListener('nowPlaying', handleGlobalPlay as EventListener);
    };
  }, [article.id, isPlaying]);

  return (
    <article 
      id={`article-${article.id}`} 
      className={cn(
        "legal-article bg-gradient-to-b from-gray-900 to-gray-800/70 p-4 rounded-md border mb-6 transition-all hover:shadow-md relative group",
        hasAudioComment 
          ? "border-gray-600 hover:border-netflix-red/50" 
          : "border-gray-800 hover:border-gray-700",
        hasNumber && hasAudioComment && "animate-fade-in"
      )}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          {article.number && (
            <h3 className="legal-article-number font-serif text-lg font-bold text-netflix-red mb-2">
              Art. {article.number}
              {hasAudioComment && (
                <span className="ml-2 text-xs bg-netflix-red/20 text-netflix-red px-1.5 py-0.5 rounded-full">
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
              "text-netflix-red hover:bg-gray-800/50 flex-shrink-0 transition-all",
              hasAudioComment ? "opacity-100" : "opacity-70 hover:opacity-100"
            )}
            onClick={() => setActiveDialog('comment')}
            aria-label={isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Volume className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-netflix-red hover:bg-gray-800/50 flex-shrink-0 transition-all",
              articleIsFavorite ? "opacity-100" : "opacity-70 group-hover:opacity-100"
            )}
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

      {/* Hidden audio element for commentary playback */}
      {hasAudioComment && (
        <audio 
          ref={audioRef}
          src={article.comentario_audio}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          onCanPlay={handleAudioCanPlay}
          preload="metadata"
        />
      )}

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

      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        {hasAudioComment && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-netflix-red/10 hover:bg-netflix-red/20 border-gray-700 hover:border-gray-600"
            onClick={() => setActiveDialog('comment')}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span className="font-medium text-netflix-red">Pausar</span>
              </>
            ) : (
              <>
                <Volume className="h-3.5 w-3.5" />
                <span className="font-medium text-netflix-red">Comentário</span>
              </>
            )}
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
      
      {hasAudioComment && isPlaying && (
        <div className="absolute -bottom-1 left-0 w-full h-1 overflow-hidden">
          <div className="audio-progress-fill h-full" style={{width: `${progress}%`}}></div>
        </div>
      )}
      
      {renderDialog()}
    </article>
  );
};

export default ArticleView;
