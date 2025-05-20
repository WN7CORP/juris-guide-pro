import { useState, useEffect, useRef } from "react";
import { Bookmark, BookmarkCheck, Info, X, Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArticleExplanationOptions } from "@/components/ArticleExplanationOptions";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element when component mounts and when article changes
  useEffect(() => {
    // Clean up previous audio element if it exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    
    // Only create audio element if article has audio comment
    if (article.comentario_audio && article.comentario_audio.trim() !== '') {
      audioRef.current = new Audio(article.comentario_audio);
      
      // Set up event listeners
      audioRef.current.addEventListener('play', handleAudioPlay);
      audioRef.current.addEventListener('pause', handleAudioPause);
      audioRef.current.addEventListener('ended', handleAudioEnded);
      audioRef.current.addEventListener('canplay', handleAudioCanPlay);
      audioRef.current.addEventListener('error', handleAudioError);
      
      // Reset states
      setIsPlaying(false);
      setAudioLoaded(false);
      setAudioLoading(false);
      setAudioError(null);
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', handleAudioPlay);
        audioRef.current.removeEventListener('pause', handleAudioPause);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('canplay', handleAudioCanPlay);
        audioRef.current.removeEventListener('error', handleAudioError);
      }
    };
  }, [article.comentario_audio, article.id]);
  
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

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  const toggleAudioPlay = () => {
    // Log for debugging
    console.log("Toggle audio play called, current audio ref:", audioRef.current);
    console.log("Audio URL:", article.comentario_audio);
    
    if (!audioRef.current && hasAudioComment) {
      // If audioRef is not set but we have an audio URL, create it
      audioRef.current = new Audio(article.comentario_audio);
      
      // Set up event listeners
      audioRef.current.addEventListener('play', handleAudioPlay);
      audioRef.current.addEventListener('pause', handleAudioPause);
      audioRef.current.addEventListener('ended', handleAudioEnded);
      audioRef.current.addEventListener('canplay', handleAudioCanPlay);
      audioRef.current.addEventListener('error', handleAudioError);
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setAudioLoading(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setAudioLoading(false);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            setAudioError(`Erro ao reproduzir áudio: ${error.message}`);
            setAudioLoading(false);
            toast.error("Não foi possível reproduzir o áudio");
          });
      }
    } else if (hasAudioComment) {
      toast.error("Problema ao inicializar o áudio. Tente novamente.");
    } else {
      toast.info("Comentário em áudio em breve disponível");
    }
  };

  const handleAudioPlay = () => {
    console.log("Audio play event triggered");
    setIsPlaying(true);
    setAudioLoading(false);
  };

  const handleAudioPause = () => {
    console.log("Audio pause event triggered");
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    console.log("Audio ended event triggered");
    setIsPlaying(false);
  };

  const handleAudioCanPlay = () => {
    console.log("Audio can play event triggered");
    setAudioLoaded(true);
    setAudioLoading(false);
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
        content = 'Ouça o comentário de áudio sobre este artigo.';
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
              <div className="flex flex-col items-center justify-center gap-4 my-4">
                <Button
                  variant="outline"
                  size="lg"
                  className={`rounded-full h-16 w-16 p-0 ${isPlaying ? 'bg-law-accent text-white' : 'bg-gray-800 text-law-accent'}`}
                  onClick={toggleAudioPlay}
                  disabled={audioLoading}
                >
                  {audioLoading ? (
                    <div className="h-5 w-5 border-2 border-law-accent border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume className="h-6 w-6" />
                  )}
                </Button>
                <p className="text-center text-sm">
                  {audioLoading ? "Carregando áudio..." : isPlaying ? "Reproduzindo..." : "Clique para ouvir"}
                </p>
                {audioError && (
                  <div className="text-red-500 text-xs p-2 bg-red-900/20 rounded">
                    {audioError}
                  </div>
                )}
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

  return (
    <TooltipProvider>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-law-accent hover:bg-background-dark flex-shrink-0 transition-opacity",
                    hasAudioComment ? "opacity-100" : "opacity-70 hover:opacity-100"
                  )}
                  onClick={toggleAudioPlay}
                  aria-label={isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
                  disabled={!hasAudioComment || audioLoading}
                >
                  {audioLoading ? (
                    <div className="h-5 w-5 border-2 border-law-accent border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? "Pausar comentário" : hasAudioComment ? "Ouvir comentário" : "Comentário indisponível"}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
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
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "text-xs flex gap-1 h-7 px-2.5 rounded-full border-gray-700 hover:border-gray-600",
              hasAudioComment 
                ? "bg-law-accent/10 hover:bg-law-accent/20" 
                : "bg-gray-800/60 hover:bg-gray-700"
            )}
            onClick={() => setActiveDialog('comment')}
            disabled={!hasAudioComment}
          >
            <Volume className="h-3.5 w-3.5" />
            <span className={cn(
              "font-medium",
              hasAudioComment ? "text-[#ea384c]" : "text-gray-300"
            )}>Comentário</span>
          </Button>

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
    </TooltipProvider>
  );
};

export default ArticleView;
