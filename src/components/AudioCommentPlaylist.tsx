
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
import React, { useMemo } from 'react';
import { LegalArticle } from '@/services/legalCodeService';
import { legalCodes } from '@/data/legalCodes';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AudioCommentPlaylistProps {
  articlesMap: Record<string, LegalArticle[]>;
  onArticleSelect?: (article: LegalArticle) => void;
}

const AudioCommentPlaylist: React.FC<AudioCommentPlaylistProps> = ({ articlesMap, onArticleSelect }) => {
  const [playingAudioId, setPlayingAudioId] = React.useState<string | null>(null);
  
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
    
    // Play audio
    audioElement.play()
      .then(() => {
        setPlayingAudioId(articleId);
        
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
          <h2 className="text-xl font-serif font-medium mb-4 text-law-accent">{codeTitle}</h2>
          <div className="space-y-3">
            {articles.map(article => (
              <div 
                key={article.id?.toString()} 
                className="border border-gray-800 rounded-md p-3 hover:bg-gray-800/20 transition-colors"
                onClick={() => onArticleSelect && article && onArticleSelect(article)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Art. {article.numero || "Sem número"}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (article.comentario_audio) {
                          handleDownload(e, article.comentario_audio, article.numero?.toString(), codeTitle);
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Baixar</span>
                    </Button>
                    
                    <Button
                      variant={playingAudioId === article.id?.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (article.comentario_audio) {
                          playAudio(
                            article.id?.toString() || "", 
                            article.comentario_audio,
                            article.numero?.toString(),
                            codeId
                          );
                        }
                      }}
                      className="flex gap-1 items-center"
                    >
                      {playingAudioId === article.id?.toString() ? (
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
                
                {article.artigo && (
                  <div className="mt-2 text-sm text-gray-400">
                    {article.artigo.slice(0, 100)}
                    {article.artigo.length > 100 ? '...' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    });
    
    return result;
  }, [articlesMap, playingAudioId, onArticleSelect]);

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
