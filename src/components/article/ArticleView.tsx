
import { useState, useRef, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { preloadAudio } from "@/services/audioPreloadService";
import { toast } from "sonner";
import AudioMiniPlayer from "@/components/AudioMiniPlayer";
import { Volume } from "lucide-react"; // Add this import

import ArticleHeader from "./ArticleHeader";
import ArticleContent from "./ArticleContent";
import ArticleFooter from "./ArticleFooter";
import ArticleExplanations from "./ArticleExplanations";

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
  
  return (
    <TooltipProvider>
      <article className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700 relative">
        {/* Article Header */}
        <ArticleHeader 
          id={article.id}
          number={article.number}
          title={article.title}
          hasAudioComment={hasAudioComment}
          isPlaying={isPlaying}
          onToggleAudio={toggleAudioPlay}
        />
        
        {/* Article Content */}
        <ArticleContent 
          content={article.content}
          items={article.items}
          paragraphs={article.paragraphs}
          hasNumber={hasNumber}
        />
        
        {/* Article Footer */}
        <ArticleFooter 
          hasAudioComment={hasAudioComment}
          isPlaying={isPlaying}
          onToggleAudio={toggleAudioPlay}
          hasExplanations={!!hasExplanations}
          hasNumber={hasNumber}
          hasExplanation={!!article.explanation}
          hasFormalExplanation={!!article.formalExplanation}
          hasPracticalExample={!!article.practicalExample}
          onOpenExplanation={() => handleExplanationDialog('explanation')}
          onOpenFormal={() => handleExplanationDialog('formal')}
          onOpenExample={() => handleExplanationDialog('example')}
        />
        
        {/* Article Explanations Dialog */}
        <ArticleExplanations 
          activeDialog={activeDialog}
          onCloseDialog={() => setActiveDialog(null)}
          explanation={article.explanation}
          formalExplanation={article.formalExplanation}
          practicalExample={article.practicalExample}
        />
        
        {/* Mini Audio Player */}
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
        
        {/* Minimized Audio Player */}
        {showMiniPlayer && minimizedPlayer && hasAudioComment && (
          <div 
            className="fixed bottom-20 right-4 z-30 sm:bottom-auto sm:top-24 bg-law-accent rounded-full p-2 shadow-lg cursor-pointer hover:bg-law-accent/80 transition-colors"
            onClick={() => setMinimizedPlayer(false)}
          >
            <Volume className="h-5 w-5 text-white" />
          </div>
        )}
      </article>
    </TooltipProvider>
  );
};

export default ArticleView;
