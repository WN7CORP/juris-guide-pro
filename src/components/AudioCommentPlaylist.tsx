// Global state for audio playback across the application
interface MinimalPlayerInfo {
  articleId: string;
  articleNumber?: string;
  codeId: string;
  audioUrl: string;
}

interface GlobalAudioState {
  audioElement: HTMLAudioElement | null;
  currentAudioId: string;
  isPlaying: boolean;
  minimalPlayerInfo: MinimalPlayerInfo | null;
  
  // Method to stop any currently playing audio
  stopCurrentAudio: () => void;
}

// Initialize global audio state
export const globalAudioState: GlobalAudioState = {
  audioElement: null,
  currentAudioId: "",
  isPlaying: false,
  minimalPlayerInfo: null,
  
  // Stop any currently playing audio before starting a new one
  stopCurrentAudio: () => {
    if (globalAudioState.audioElement && !globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.pause();
      globalAudioState.audioElement.currentTime = 0;
      globalAudioState.isPlaying = false;
    }
  }
};

// Add the AudioCommentPlaylist component
import React, { useMemo, useState } from 'react';
import { LegalArticle } from '@/services/legalCodeService';
import { legalCodes } from '@/data/legalCodes';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioCommentPlaylistProps {
  articlesMap: Record<string, LegalArticle[]>;
}

const AudioCommentPlaylist: React.FC<AudioCommentPlaylistProps> = ({ articlesMap }) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  
  // Check global audio state to keep UI in sync
  React.useEffect(() => {
    const checkInterval = setInterval(() => {
      setPlayingAudioId(globalAudioState.currentAudioId || null);
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, []);

  // Play audio function
  const playAudio = (articleId: string, audioUrl: string, articleNumber?: string, codeId?: string) => {
    // If this article is already playing, stop it
    if (playingAudioId === articleId) {
      globalAudioState.stopCurrentAudio();
      setPlayingAudioId(null);
      return;
    }
    
    // Stop any currently playing audio
    globalAudioState.stopCurrentAudio();
    
    // Create and play new audio element
    const audioElement = new Audio(audioUrl);
    
    // Set up events
    audioElement.addEventListener('ended', () => {
      setPlayingAudioId(null);
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
    });
    
    audioElement.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      setPlayingAudioId(null);
      toast.error("Erro ao reproduzir áudio");
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
    });
    
    // Play audio and automatically expand the article text
    audioElement.play()
      .then(() => {
        setPlayingAudioId(articleId);
        setExpandedArticle(articleId);
        
        // Update global state
        globalAudioState.audioElement = audioElement;
        globalAudioState.currentAudioId = articleId;
        globalAudioState.isPlaying = true;
        globalAudioState.minimalPlayerInfo = {
          articleId,
          articleNumber,
          codeId: codeId || "",
          audioUrl
        };
      })
      .catch(error => {
        console.error("Failed to play audio:", error);
        toast.error("Erro ao reproduzir áudio");
      });
  };

  // Handle audio download
  const handleDownload = (e: React.MouseEvent, audioUrl: string, articleNumber?: string, codeTitle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create an anchor element for download
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `comentario-${codeTitle ? codeTitle + '-' : ''}art-${articleNumber || 'sem-numero'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Download do comentário em áudio iniciado");
  };

  // Toggle expanded article text
  const toggleArticleExpand = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(articleId);
    }
  };

  // Find code titles by ID for better display
  const getCodeTitleById = (codeId: string): string => {
    const code = legalCodes.find(code => code.id === codeId);
    return code ? code.title : codeId;
  };

  // Memoize the sections to prevent unnecessary re-renders
  const sections = useMemo(() => {
    const result: JSX.Element[] = [];
    
    // Create a section for each code
    Object.entries(articlesMap).forEach(([codeId, articles]) => {
      if (articles.length === 0) return;
      
      const codeTitle = getCodeTitleById(codeId);
      
      result.push(
        <section key={codeId} className="mb-8">
          <h2 className="text-xl font-serif font-medium mb-4 text-law-accent border-b border-gray-800 pb-2">{codeTitle}</h2>
          <div className="space-y-4">
            {articles.map(article => {
              const isExpanded = expandedArticle === article.id?.toString();
              const isPlaying = playingAudioId === article.id?.toString();
              
              return (
                <div 
                  key={article.id} 
                  className={cn(
                    "border border-gray-800 rounded-md p-3 transition-all duration-200",
                    isPlaying ? "bg-sky-950/20 border-sky-800" : "hover:bg-gray-800/20"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className={cn("transition-colors", isPlaying ? "text-law-accent" : "")}>
                        Art. {article.numero || "Sem número"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-700/50"
                        onClick={(e) => toggleArticleExpand(e, article.id?.toString() || "")}
                      >
                        {isExpanded ? 
                          <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                        <span className="sr-only">{isExpanded ? "Recolher" : "Expandir"}</span>
                      </Button>
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-700/50"
                        onClick={(e) => handleDownload(e, article.comentario_audio || '', article.numero, codeTitle)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Baixar</span>
                      </Button>
                      
                      <Button
                        variant={isPlaying ? "default" : "outline"}
                        size="sm"
                        onClick={() => playAudio(
                          article.id?.toString() || "", 
                          article.comentario_audio || '',
                          article.numero,
                          codeId
                        )}
                        className={cn(
                          "flex gap-1 items-center transition-all duration-150",
                          isPlaying ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white" : ""
                        )}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-3 w-3" />
                            <span className="text-xs">Pausar</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            <span className="text-xs">Ouvir</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Article content - always shown when playing, conditionally shown when expanded */}
                  {(isExpanded || isPlaying) && article.artigo && (
                    <div className={cn(
                      "mt-3 text-sm text-gray-300 space-y-2 p-3 border-t border-gray-700",
                      isPlaying ? "bg-sky-950/10 rounded" : ""
                    )}>
                      {article.artigo.split('\n').map((paragraph, i) => (
                        <p key={i} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Short preview when not expanded */}
                  {!isExpanded && !isPlaying && article.artigo && (
                    <div className="mt-2 text-sm text-gray-400">
                      {article.artigo.slice(0, 100)}
                      {article.artigo.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    });
    
    return result;
  }, [articlesMap, playingAudioId, expandedArticle]);

  // If no articles with audio found
  if (Object.values(articlesMap).every(articles => articles.length === 0)) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">Não foram encontrados comentários em áudio.</p>
      </div>
    );
  }

  return <div className="space-y-6">{sections}</div>;
};

// Add default export
export default AudioCommentPlaylist;
