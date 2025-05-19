
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume, VolumeX } from "lucide-react";
import { LegalArticle } from "@/services/legalCodeService";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

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

  // Filter out articles without audio comments
  const articlesWithAudio = articles.filter(article => article.comentario_audio);

  // Set up automatic play for current article if specified
  useEffect(() => {
    if (currentArticleId && !currentPlaying) {
      const article = articlesWithAudio.find(a => a.id?.toString() === currentArticleId);
      if (article && article.comentario_audio) {
        playAudio(currentArticleId, article.comentario_audio);
      }
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.removeEventListener('ended', handleAudioEnded);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentArticleId]);

  const playAudio = (articleId: string, audioUrl: string) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.removeEventListener('ended', handleAudioEnded);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    // Create new audio element
    const newAudio = new Audio(audioUrl);
    setAudioElement(newAudio);
    
    // Set up event listeners
    newAudio.addEventListener('loadedmetadata', () => {
      setDuration(newAudio.duration);
    });
    
    newAudio.addEventListener('ended', handleAudioEnded);
    newAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      toast.error("Não foi possível reproduzir o áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
      clearProgressInterval();
    });
    
    // Play the audio
    newAudio.play().then(() => {
      // Start progress tracking
      trackProgress(newAudio);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      toast.error("Erro ao reproduzir áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
    });
    
    // Update state
    setCurrentPlaying(articleId);
    setIsPlaying(true);
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

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentPlaying(null);
    clearProgressInterval();
  };

  const togglePlayPause = (article: LegalArticle) => {
    if (!article.id || !article.comentario_audio) return;
    
    const articleId = article.id.toString();
    
    if (currentPlaying === articleId) {
      if (isPlaying) {
        pauseAudio();
      } else {
        if (audioElement) {
          audioElement.play()
            .then(() => {
              setIsPlaying(true);
              trackProgress(audioElement);
            })
            .catch(error => {
              console.error('Error resuming audio:', error);
              toast.error("Erro ao retomar áudio");
            });
        }
      }
    } else {
      playAudio(articleId, article.comentario_audio);
    }
  };

  if (articlesWithAudio.length === 0) {
    return (
      <Card className="p-4 mb-6 bg-background-dark border border-gray-800">
        <h3 className="text-lg font-serif font-bold text-law-accent mb-2">
          Artigos Comentados
        </h3>
        <p className="text-gray-400 text-sm">
          Não há comentários em áudio disponíveis para este código legal.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-background-dark border border-gray-800 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-bold text-law-accent">
          Artigos Comentados ({articlesWithAudio.length})
        </h3>
        <p className="text-xs text-gray-400">
          Clique em um artigo para ouvir o comentário
        </p>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {articlesWithAudio.map((article) => {
          const isCurrentPlaying = currentPlaying === article.id;
          
          return (
            <div 
              key={article.id}
              className={`flex flex-col p-2 rounded-md transition-colors duration-300 ${
                isCurrentPlaying
                  ? 'bg-law-accent/20 border border-law-accent animate-pulse-soft' 
                  : 'bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700'
              } cursor-pointer`}
            >
              <div className="flex items-center justify-between" onClick={() => togglePlayPause(article)}>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-full p-0 text-law-accent"
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
                      <Volume className="h-4 w-4 text-law-accent" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    )
                  ) : null}
                </div>
              </div>
              
              {isCurrentPlaying && (
                <div className="mt-2 px-2">
                  <Progress value={progress} className="h-1" />
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
