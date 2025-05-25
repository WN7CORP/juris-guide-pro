
import { useState, useRef, useEffect } from "react";
import { Bookmark, BookmarkCheck, Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useNavigate } from "react-router-dom";
import AprofundarButton from "@/components/AprofundarButton";
import AudioMiniPlayer from "@/components/AudioMiniPlayer";
import { getAudio, preloadAudio } from "@/services/audioPreloadService";
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
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [minimizedPlayer, setMinimizedPlayer] = useState(false);

  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if this article is currently playing in the global audio state
  useEffect(() => {
    setIsPlaying(globalAudioState.currentAudioId === article.id);
    
    // Set up interval to check global audio state
    const checkInterval = setInterval(() => {
      setIsPlaying(globalAudioState.currentAudioId === article.id);
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [article.id]);

  // Pre-load audio on component mount
  useEffect(() => {
    if (article.comentario_audio) {
      // Pré-carregar o áudio assim que o componente for montado
      preloadAudio(article.comentario_audio)
        .then(audio => {
          audioRef.current = audio;
          console.log(`Áudio pré-carregado com sucesso para artigo ${article.id}`);
          
          // Set up event listeners
          audio.addEventListener('play', handleAudioPlay);
          audio.addEventListener('pause', handleAudioPause);
          audio.addEventListener('ended', handleAudioEnded);
          audio.addEventListener('error', handleAudioError);
        })
        .catch(error => {
          console.error(`Erro ao pré-carregar áudio para artigo ${article.id}:`, error);
          setAudioError("Erro ao carregar áudio");
        });
    }

    // Cleanup function to remove event listeners
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handleAudioPlay);
        audioRef.current.removeEventListener('pause', handleAudioPause);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);

        // Pause audio if it's playing
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
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

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  // Check if article has audio commentary
  const hasAudioComment = !!article.comentario_audio;

  // Check if article has number to determine text alignment
  const hasNumber = !!article.number;
  
  const toggleAudioPlay = () => {
    if (showMiniPlayer) {
      setShowMiniPlayer(false);
      setMinimizedPlayer(false);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
      }
      return;
    }
    
    // Show mini player instead of playing directly
    setShowMiniPlayer(true);
    setMinimizedPlayer(false);
  };
  
  const handleAudioPlay = () => {
    console.log(`Audio started playing for article ${article.id}`);
    setIsPlaying(true);
  };
  
  const handleAudioPause = () => {
    console.log(`Audio paused for article ${article.id}`);
    setIsPlaying(false);
  };
  
  const handleAudioEnded = () => {
    console.log(`Audio ended for article ${article.id}`);
    setIsPlaying(false);
    
    // Reset global state
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
  };
  
  const handleAudioError = (e: any) => {
    console.error(`Audio error for article ${article.id}:`, e);
    setIsPlaying(false);
    setAudioError("Erro ao reproduzir áudio");
    toast.error("Não foi possível reproduzir o áudio do comentário");
    
    // Reset global state on error
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
  };
  
  const handleCloseMiniPlayer = () => {
    setShowMiniPlayer(false);
    setMinimizedPlayer(false);
    
    // Pause audio if it's playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
    }
  };
  
  const handleMinimizePlayer = () => {
    setMinimizedPlayer(true);
  };
  
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
            {hasAudioComment && <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isPlaying ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex-shrink-0", 
                      isPlaying ? "bg-law-accent text-white" : "text-law-accent hover:bg-background-dark"
                    )}
                    onClick={toggleAudioPlay}
                    aria-label={isPlaying ? "Pausar comentário em áudio" : "Ouvir comentário em áudio"}
                  >
                    {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
                </TooltipContent>
              </Tooltip>}
            
            
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
          {hasAudioComment && <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className={`text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700 ${isPlaying ? 'border-law-accent/50 bg-law-accent/10' : ''}`} onClick={toggleAudioPlay}>
                  {isPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume className="h-3.5 w-3.5" />}
                  <span>Comentário em Áudio</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
              </TooltipContent>
            </Tooltip>}

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
        
        
        {showMiniPlayer && !minimizedPlayer && hasAudioComment && (
          <div className="fixed bottom-20 right-4 z-30 sm:bottom-auto sm:top-24 max-w-xs w-full">
            <AudioMiniPlayer 
              audioUrl={article.comentario_audio || ''}
              articleId={article.id}
              articleNumber={article.number}
              onClose={handleCloseMiniPlayer}
              onMinimize={handleMinimizePlayer}
            />
          </div>
        )}
        
        
        {showMiniPlayer && minimizedPlayer && hasAudioComment && (
          <div 
            className="fixed bottom-20 right-4 z-30 sm:bottom-auto sm:top-24 bg-law-accent rounded-full p-2 shadow-lg cursor-pointer hover:bg-law-accent/80 transition-colors"
            onClick={() => setMinimizedPlayer(false)}
          >
            <Volume className="h-5 w-5 text-white" />
          </div>
        )}
      </article>
    </TooltipProvider>;
};

export default ArticleView;
