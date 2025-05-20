
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
import AudioVisualizer from "@/components/AudioVisualizer";
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

  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
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

  // Create audio element on component mount to get duration
  useEffect(() => {
    if (article.comentario_audio && !audioDuration) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = article.comentario_audio;
      
      const handleLoadedMetadata = () => {
        setAudioDuration(audio.duration);
        audio.remove();
      };
      
      const handleError = () => {
        setAudioError("Erro ao carregar áudio");
        audio.remove();
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleError);
        audio.remove();
      };
    }
  }, [article.comentario_audio, audioDuration]);
  
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
  
  // Format time in MM:SS
  const formatTime = (time: number | null): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const toggleAudioPlay = () => {
    if (isPlaying) {
      // Already playing, pause it
      if (globalAudioState.audioElement) {
        globalAudioState.audioElement.pause();
        globalAudioState.isPlaying = false;
        setIsPlaying(false);
      }
      return;
    }
    
    // Start playing this article
    if (!article.comentario_audio) {
      toast.error("Nenhum comentário em áudio disponível");
      return;
    }
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio(article.comentario_audio);
      
      // Set up event listeners
      const handlePlay = () => {
        setIsPlaying(true);
      };
      
      const handlePause = () => {
        setIsPlaying(false);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
        globalAudioState.minimalPlayerInfo = null;
      };
      
      const handleError = () => {
        toast.error("Erro ao reproduzir áudio");
        setAudioError("Erro ao reproduzir áudio");
        setIsPlaying(false);
      };
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      audioRef.current = audio;
    }
    
    // Update global audio state
    globalAudioState.audioElement = audioRef.current;
    globalAudioState.currentAudioId = article.id;
    globalAudioState.isPlaying = true;
    
    // Set minimal player info for the floating player
    globalAudioState.minimalPlayerInfo = {
      articleId: article.id,
      articleNumber: article.number,
      codeId: new URLSearchParams(window.location.search).get('codeId') || 
              window.location.pathname.split('/').filter(Boolean)[1] || '',
      audioUrl: article.comentario_audio
    };
    
    // Play the audio
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.error("Failed to play audio:", err);
        setAudioError("Falha ao iniciar a reprodução");
        toast.error("Falha ao reproduzir o áudio");
      });
    }
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
          {contentLines.map((line, index) => <p key={index} className="mb-2.5">{line}</p>)}
        </div>

        {article.items && article.items.length > 0 && <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
            {article.items.map((item, index) => <p key={index} className="mb-1.5 text-sm">
                {item}
              </p>)}
          </div>}

        {article.paragraphs && article.paragraphs.length > 0 && <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
            {article.paragraphs.map((paragraph, index) => <p key={index} className="mb-1.5 text-sm italic">
                {paragraph}
              </p>)}
          </div>}
        
        {/* Audio visualizer - shows when article has audio */}
        {hasAudioComment && (
          <div
            onClick={toggleAudioPlay}
            className="mt-3 mb-4 cursor-pointer hover:bg-gray-800/30 p-2 rounded-md transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-law-accent flex items-center">
                <Volume className="h-3 w-3 mr-1" />
                Comentário em Áudio
              </span>
              {audioDuration && (
                <span className="text-xs text-gray-400">
                  {formatTime(audioDuration)}
                </span>
              )}
            </div>
            <AudioVisualizer 
              audioUrl={article.comentario_audio || ''} 
              isPlaying={isPlaying}
              className="h-8 max-w-md mx-auto"
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          {hasAudioComment && <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700",
                    isPlaying ? "border-law-accent/50 bg-law-accent/10" : ""
                  )}
                  onClick={toggleAudioPlay}
                >
                  {isPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume className="h-3.5 w-3.5" />}
                  <span>Comentário em Áudio</span>
                  {audioDuration && !isPlaying && (
                    <span className="text-gray-400 text-xs">({formatTime(audioDuration)})</span>
                  )}
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
      </article>
    </TooltipProvider>;
};

export default ArticleView;
