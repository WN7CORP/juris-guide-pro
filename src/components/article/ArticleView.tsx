
import { useState, useEffect, useRef } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { toast } from "sonner";
import AudioMiniPlayer from "@/components/AudioMiniPlayer";
import { Volume } from "lucide-react";
import { preloadAudio, preloadProximityAudio } from "@/services/audioPreloadService";

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
  const articleRef = useRef<HTMLElement>(null);

  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Check if this article is currently playing in the global audio state
  useEffect(() => {
    setIsPlaying(globalAudioState.currentAudioId === article.id);
    
    // Set up interval to check global audio state
    const checkInterval = setInterval(() => {
      setIsPlaying(globalAudioState.currentAudioId === article.id);
      // Also check if player is minimized but still playing this article
      if (globalAudioState.currentAudioId === article.id && globalAudioState.isMinimized) {
        setMinimizedPlayer(true);
        setShowMiniPlayer(true);
      }
    }, 300);
    
    return () => clearInterval(checkInterval);
  }, [article.id]);

  // Pre-load audio on component mount with optimizations
  useEffect(() => {
    if (article.comentario_audio) {
      // Use requestIdleCallback or setTimeout to delay non-critical operations
      const timeoutId = setTimeout(() => {
        preloadAudio(article.comentario_audio!)
          .then(audio => {
            console.log(`Áudio pré-carregado com sucesso para artigo ${article.id}`);
          })
          .catch(error => {
            console.error(`Erro ao pré-carregar áudio para artigo ${article.id}:`, error);
            setAudioError("Erro ao carregar áudio");
          });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [article.comentario_audio, article.id]);

  // Use Intersection Observer to detect when article is visible
  useEffect(() => {
    if (!articleRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && article.comentario_audio) {
            // Preload audio when article comes into view
            preloadAudio(article.comentario_audio).catch(() => {});
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(articleRef.current);
    
    return () => {
      if (articleRef.current) observer.unobserve(articleRef.current);
    };
  }, [article.comentario_audio, article.id]);
  
  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  // Check if article has audio commentary
  const hasAudioComment = !!article.comentario_audio;

  // Check if article has number to determine text alignment
  const hasNumber = !!article.number;
  
  const toggleAudioPlay = () => {
    // If already showing mini player and it's for this article, hide it
    if (showMiniPlayer && globalAudioState.currentAudioId === article.id) {
      setShowMiniPlayer(false);
      setMinimizedPlayer(false);
      globalAudioState.stopCurrentAudio();
      return;
    }
    
    // First, stop any currently playing audio
    globalAudioState.stopCurrentAudio();
    
    // Show mini player
    setShowMiniPlayer(true);
    setMinimizedPlayer(false);
  };
  
  const handleAudioError = () => {
    setIsPlaying(false);
    setAudioError("Erro ao reproduzir áudio");
    toast.error("Não foi possível reproduzir o áudio do comentário");
  };
  
  const handleCloseMiniPlayer = () => {
    setShowMiniPlayer(false);
    setMinimizedPlayer(false);
    globalAudioState.isMinimized = false;
    globalAudioState.stopCurrentAudio();
  };
  
  const handleMinimizePlayer = () => {
    setMinimizedPlayer(true);
    globalAudioState.isMinimized = true;
    // Don't stop audio playback when minimizing
  };
  
  const handleExplanationDialog = (type: string) => {
    setActiveDialog(type);
  };
  
  return (
    <TooltipProvider>
      <article 
        ref={articleRef}
        className={`legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700 relative ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
      >
        {/* Article Header */}
        <ArticleHeader 
          id={article.id}
          number={article.number}
          title={article.title}
          content={article.content}
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
          id={article.id}
          hasAudioComment={hasAudioComment}
          isPlaying={isPlaying}
          onToggleAudio={toggleAudioPlay}
          hasExplanations={!!hasExplanations}
          hasNumber={hasNumber}
          articleNumber={article.number}
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
          <div className="fixed bottom-20 right-4 z-30 sm:bottom-auto sm:top-24 max-w-xs w-full animate-fade-in">
            <AudioMiniPlayer 
              audioUrl={article.comentario_audio || ''}
              articleId={article.id}
              articleNumber={article.number}
              onClose={handleCloseMiniPlayer}
              onMinimize={handleMinimizePlayer}
            />
          </div>
        )}
        
        {/* Minimized Audio Player - Audio continues playing but UI is minimized */}
        {showMiniPlayer && minimizedPlayer && hasAudioComment && (
          <div 
            className="fixed bottom-28 right-4 z-30 bg-law-accent rounded-full p-3 shadow-lg cursor-pointer hover:bg-law-accent/80 transition-colors"
            onClick={() => setMinimizedPlayer(false)}
          >
            <div className="relative flex items-center justify-center">
              <Volume className="h-6 w-6 text-white" />
              {/* Animated sound waves */}
              <span className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-white/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
              <span className="absolute top-0 left-0 w-full h-full rounded-full border border-white/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_500ms]"></span>
            </div>
          </div>
        )}
      </article>
    </TooltipProvider>
  );
};

export default ArticleView;
