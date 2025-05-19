import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume, VolumeX, AlertCircle } from "lucide-react";
import { LegalArticle } from "@/services/legalCodeService";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AudioCommentPlaylistProps {
  articles: LegalArticle[];
  title: string;
  currentArticleId?: string;
}

const AudioCommentPlaylist = ({ articles, title, currentArticleId }: AudioCommentPlaylistProps) => {
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Filter out articles without audio comments
  const articlesWithAudio = articles.filter(article => 
    article.comentario_audio && 
    article.comentario_audio.trim() !== ''
  );

  // Log for debugging
  useEffect(() => {
    console.log(`AudioCommentPlaylist received ${articles.length} articles`);
    console.log(`Found ${articlesWithAudio.length} articles with valid audio comments`);
    
    if (articlesWithAudio.length === 0 && articles.length > 0) {
      console.warn("No articles with audio comments found despite receiving articles");
    }
  }, [articles, articlesWithAudio.length]);

  // Set up automatic play for current article if specified
  useEffect(() => {
    if (currentArticleId && !currentPlaying) {
      const article = articlesWithAudio.find(a => a.id?.toString() === currentArticleId);
      if (article && article.comentario_audio) {
        console.log(`Auto-playing article ${currentArticleId} with audio: ${article.comentario_audio}`);
        playAudio(currentArticleId, article.comentario_audio, article.numero || '');
      } else if (article) {
        console.error(`Article ${currentArticleId} found but has no audio comment`);
      } else {
        console.error(`Article ${currentArticleId} not found in articlesWithAudio list`);
      }
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        // Fixed: Correctly handle ended event
        audioElement.removeEventListener('ended', () => {
          if (currentPlaying) handleAudioEnded(currentPlaying);
        });
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentArticleId, articlesWithAudio]);

  // Listen for global nowPlaying events
  useEffect(() => {
    const handleNowPlaying = (e: CustomEvent) => {
      const detail = e.detail as { 
        articleId: string, 
        articleNumber: string,
        audioUrl: string 
      };
      
      // If this is not coming from the playlist, update our state
      if (!currentPlaying || currentPlaying !== detail.articleId) {
        console.log(`External play detected for article ${detail.articleId}`);
        setCurrentPlaying(detail.articleId);
        setIsPlaying(true);
        
        // If we have an audio element playing something else, stop it
        if (audioElement && audioElement.src !== detail.audioUrl) {
          audioElement.pause();
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          
          // Create new audio element with the current URL
          const newAudio = new Audio(detail.audioUrl);
          setupAudioElement(newAudio, detail.articleId);
          
          // Manually set progress update interval
          const intervalId = window.setInterval(() => {
            if (newAudio) {
              const percentage = (newAudio.currentTime / newAudio.duration) * 100;
              setProgress(percentage || 0);
            }
          }, 100);
          
          progressIntervalRef.current = intervalId;
          setAudioElement(newAudio);
        }
      }
    };
    
    const handleAudioEnded = (e: CustomEvent) => {
      const detail = e.detail as { articleId: string };
      if (currentPlaying === detail.articleId) {
        console.log(`Audio ended for article ${detail.articleId}`);
        setCurrentPlaying(null);
        setIsPlaying(false);
        clearProgressInterval();
      }
    };
    
    // Use type assertion for the event listeners
    document.addEventListener('nowPlaying', handleNowPlaying as EventListener);
    document.addEventListener('audioEnded', handleAudioEnded as EventListener);
    
    return () => {
      document.removeEventListener('nowPlaying', handleNowPlaying as EventListener);
      document.removeEventListener('audioEnded', handleAudioEnded as EventListener);
    };
  }, [currentPlaying, audioElement]);

  const playAudio = (articleId: string, audioUrl: string, articleNumber: string) => {
    // Validate the audio URL
    if (!audioUrl || audioUrl.trim() === '') {
      toast.error("URL de áudio inválida");
      return;
    }

    console.log(`Attempting to play audio from: ${audioUrl}`);
    setAudioError(null);

    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      // Fixed: Use a proper event handler function
      audioElement.removeEventListener('ended', () => {
        if (currentPlaying) handleAudioEnded(currentPlaying);
      });
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    // Create new audio element
    const newAudio = new Audio(audioUrl);
    setupAudioElement(newAudio, articleId);
    
    // Dispatch global event
    const event = new CustomEvent('nowPlaying', { 
      detail: { 
        articleId, 
        articleNumber,
        audioUrl 
      } 
    });
    document.dispatchEvent(event);
    
    // Play the audio
    newAudio.play().then(() => {
      console.log('Audio playback started successfully');
      // Start progress tracking
      trackProgress(newAudio);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      setAudioError(error.message);
      toast.error("Erro ao reproduzir áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
    });
    
    // Update state
    setCurrentPlaying(articleId);
    setIsPlaying(true);
    setAudioElement(newAudio);
  };

  const setupAudioElement = (audio: HTMLAudioElement, articleId: string) => {
    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      console.log(`Audio metadata loaded, duration: ${audio.duration}`);
      setDuration(audio.duration);
    });
    
    // Fixed: Use a proper function that accepts an Event parameter
    audio.addEventListener('ended', () => {
      handleAudioEnded(articleId);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      const error = e.target as HTMLAudioElement;
      const errorMessage = error.error ? `Código: ${error.error.code}` : 'Erro desconhecido';
      setAudioError(errorMessage);
      toast.error("Não foi possível reproduzir o áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
      clearProgressInterval();
      
      // Dispatch global event for audio ended
      const event = new CustomEvent('audioEnded', { detail: { articleId } });
      document.dispatchEvent(event);
    });
  };

  const handleAudioEnded = (articleId: string) => {
    console.log('Audio playback ended');
    setIsPlaying(false);
    setCurrentPlaying(null);
    clearProgressInterval();
    
    // Dispatch global event for audio ended
    const event = new CustomEvent('audioEnded', { detail: { articleId } });
    document.dispatchEvent(event);
  };

  const trackProgress = (audio: HTMLAudioElement) => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Set up new progress tracking
    const intervalId = window.setInterval(() => {
      if (audio) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        setProgress(isNaN(percentage) ? 0 : percentage);
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

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    setIsPlaying(false);
    
    // Send global pause event
    if (currentPlaying) {
      const article = articlesWithAudio.find(a => a.id?.toString() === currentPlaying);
      if (article) {
        const event = new CustomEvent('audioPaused', { 
          detail: { 
            articleId: currentPlaying 
          } 
        });
        document.dispatchEvent(event);
      }
    }
  };

  const togglePlayPause = (article: LegalArticle) => {
    if (!article.id || !article.comentario_audio) {
      console.error('Cannot play article: missing ID or audio URL');
      toast.error("Comentário em áudio não disponível");
      return;
    }
    
    const articleId = article.id.toString();
    
    if (currentPlaying === articleId) {
      if (isPlaying) {
        console.log('Pausing current audio');
        pauseAudio();
      } else {
        console.log('Resuming current audio');
        if (audioElement) {
          audioElement.play()
            .then(() => {
              setIsPlaying(true);
              trackProgress(audioElement);
              
              // Dispatch global event
              const event = new CustomEvent('nowPlaying', { 
                detail: { 
                  articleId, 
                  articleNumber: article.numero || '',
                  audioUrl: article.comentario_audio 
                } 
              });
              document.dispatchEvent(event);
            })
            .catch(error => {
              console.error('Error resuming audio:', error);
              setAudioError(error.message);
              toast.error("Erro ao retomar áudio");
            });
        }
      }
    } else {
      console.log(`Playing new audio for article ${articleId}: ${article.comentario_audio}`);
      playAudio(articleId, article.comentario_audio, article.numero || '');
    }
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (articlesWithAudio.length === 0) {
    return (
      <Card className="p-4 mb-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <Volume className="h-8 w-8 text-gray-500 mb-2" />
          <h3 className="text-lg font-serif font-bold text-netflix-red mb-2">
            Artigos Comentados
          </h3>
          <p className="text-gray-400 text-sm">
            Não há comentários em áudio disponíveis para este código legal.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-bold text-netflix-red flex items-center gap-2">
          <Volume className="h-5 w-5" />
          <span>Artigos Comentados ({articlesWithAudio.length})</span>
        </h3>
        <p className="text-xs text-gray-400">
          Clique para ouvir o comentário
        </p>
      </div>
      
      {audioError && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>Erro ao reproduzir áudio: {audioError}</span>
        </div>
      )}
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {articlesWithAudio.map((article) => {
          const isCurrentPlaying = currentPlaying === article.id;
          
          return (
            <div 
              key={article.id}
              className={cn(
                "flex flex-col p-2 rounded-md transition-colors duration-300 border cursor-pointer",
                isCurrentPlaying && isPlaying
                  ? "bg-netflix-red/20 border-netflix-red animate-pulse-soft" 
                  : "bg-gray-800/30 hover:bg-gray-800/50 border-gray-700"
              )}
            >
              <div className="flex items-center justify-between" onClick={() => togglePlayPause(article)}>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-8 w-8 rounded-full p-0", 
                      isCurrentPlaying && isPlaying 
                        ? "bg-netflix-red text-white" 
                        : "bg-netflix-red/20 text-netflix-red hover:bg-netflix-red/30"
                    )}
                  >
                    {isCurrentPlaying && isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <p className="font-medium">Art. {article.numero}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {article.artigo.substring(0, 60)}...
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isCurrentPlaying ? (
                    isPlaying ? (
                      <div className="audio-wave flex gap-[2px] items-end h-4">
                        <span className="w-[2px] h-2 bg-netflix-red rounded-full animate-pulse"></span>
                        <span className="w-[2px] h-3 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.1s"}}></span>
                        <span className="w-[2px] h-1 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.2s"}}></span>
                        <span className="w-[2px] h-2 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.15s"}}></span>
                      </div>
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    )
                  ) : null}
                </div>
              </div>
              
              {isCurrentPlaying && (
                <div className="mt-2 px-2">
                  <div className="audio-progress-bar">
                    <div className="audio-progress-fill" style={{width: `${progress}%`}}></div>
                  </div>
                  {audioElement && (
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatTime(audioElement.currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AudioCommentPlaylist;
