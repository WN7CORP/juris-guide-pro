import React, { useState, useEffect, useRef } from "react";
import { Volume, Play, Pause, VolumeX, SkipForward, SkipBack, Minimize, Shuffle, Repeat, List } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LegalArticle } from "@/services/legalCodeService";
import { legalCodes } from "@/data/legalCodes";
import { cn } from "@/lib/utils";

interface AudioCommentPlaylistProps {
  articlesMap: Record<string, LegalArticle[]>;
}

interface MinimalPlayerInfo {
  articleId: string;
  articleNumber: string;
  codeId: string;
  audioUrl: string;
}

// Enhanced global state for the audio player
export const globalAudioState = {
  currentAudioId: "",
  isPlaying: false,
  audioElement: null as HTMLAudioElement | null,
  minimalPlayerInfo: null as MinimalPlayerInfo | null,
  currentTime: 0,
  duration: 0,
  // Method to stop current audio playback
  stopCurrentAudio: () => {
    if (globalAudioState.audioElement && !globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
    }
  }
};

const AudioCommentPlaylist: React.FC<AudioCommentPlaylistProps> = ({ articlesMap }) => {
  const navigate = useNavigate();
  const [playingArticleId, setPlayingArticleId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Format time in MM:SS format
  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Update global audio state
  useEffect(() => {
    globalAudioState.currentAudioId = playingArticleId || "";
    globalAudioState.isPlaying = !!playingArticleId;
    globalAudioState.audioElement = audioRef.current;
    
    // Update time tracking
    if (audioRef.current) {
      const updateTimeTracking = () => {
        globalAudioState.currentTime = audioRef.current?.currentTime || 0;
        globalAudioState.duration = audioRef.current?.duration || 0;
      };
      
      const timeTrackingInterval = setInterval(updateTimeTracking, 100);
      return () => clearInterval(timeTrackingInterval);
    }
  }, [playingArticleId]);

  // Handle audio playback
  const toggleAudioPlay = (articleId: string, audioUrl?: string, codeId?: string, articleNumber?: string) => {
    if (!audioUrl) return;
    
    // If this article is already playing, pause it
    if (playingArticleId === articleId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingArticleId(null);
      return;
    }
    
    // First, stop any currently playing audio (both in this component and globally)
    if (audioRef.current) {
      audioRef.current.pause();
    }
    globalAudioState.stopCurrentAudio();
    
    // Create a new audio element if one doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Set up the audio element
    audioRef.current.src = audioUrl || '';
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.volume = volume;
    
    // Add event listeners
    const onEnded = () => {
      setPlayingArticleId(null);
      playNextAudio(articleId);
    };
    
    const onError = (e: Event) => {
      console.error("Audio error:", e);
      setPlayingArticleId(null);
    };
    
    const onTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        globalAudioState.currentTime = audioRef.current.currentTime;
      }
    };
    
    const onLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
        globalAudioState.duration = audioRef.current.duration;
      }
    };
    
    // Remove previous event listeners before adding new ones
    audioRef.current.removeEventListener('ended', onEnded);
    audioRef.current.removeEventListener('error', onError as EventListener);
    audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
    audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
    
    // Add new event listeners
    audioRef.current.addEventListener('ended', onEnded);
    audioRef.current.addEventListener('error', onError as EventListener);
    audioRef.current.addEventListener('timeupdate', onTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    
    // Play the audio
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlayingArticleId(articleId);
          // Set minimal player info
          if (codeId && articleNumber) {
            globalAudioState.minimalPlayerInfo = {
              articleId,
              articleNumber,
              codeId,
              audioUrl: audioUrl || ''
            };
          }
        })
        .catch(error => {
          console.error("Failed to play audio:", error);
          setPlayingArticleId(null);
        });
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current && value.length > 0) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (value.length > 0) {
      setVolume(value[0]);
      if (audioRef.current) {
        audioRef.current.volume = value[0];
      }
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Play next audio
  const playNextAudio = (currentArticleId: string) => {
    // Get all articles with audio
    const allArticles: {article: LegalArticle, codeId: string}[] = [];
    Object.entries(articlesMap).forEach(([codeId, articles]) => {
      articles.forEach(article => {
        if (article.comentario_audio) {
          allArticles.push({article, codeId});
        }
      });
    });

    // Find the current index
    const currentIndex = allArticles.findIndex(item => item.article.id?.toString() === currentArticleId);
    if (currentIndex > -1 && currentIndex < allArticles.length - 1) {
      const nextArticle = allArticles[currentIndex + 1];
      toggleAudioPlay(
        nextArticle.article.id?.toString() || "", 
        nextArticle.article.comentario_audio,
        nextArticle.codeId,
        nextArticle.article.numero || "Sem número"
      );
    }
  };

  // Play previous audio
  const playPreviousAudio = (currentArticleId: string) => {
    // Get all articles with audio
    const allArticles: {article: LegalArticle, codeId: string}[] = [];
    Object.entries(articlesMap).forEach(([codeId, articles]) => {
      articles.forEach(article => {
        if (article.comentario_audio) {
          allArticles.push({article, codeId});
        }
      });
    });

    // Find the current index
    const currentIndex = allArticles.findIndex(item => item.article.id?.toString() === currentArticleId);
    if (currentIndex > 0) {
      const prevArticle = allArticles[currentIndex - 1];
      toggleAudioPlay(
        prevArticle.article.id?.toString() || "", 
        prevArticle.article.comentario_audio,
        prevArticle.codeId,
        prevArticle.article.numero || "Sem número"
      );
    }
  };
  
  // Find the code name based on ID
  const getCodeTitle = (codeId: string): string => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : "Código Desconhecido";
  };
  
  // Count total articles with audio
  const totalAudioArticles = Object.values(articlesMap).reduce(
    (total, articles) => total + articles.length, 0
  );

  // Get filtered articles - optimized to avoid unnecessary operations
  const getFilteredArticles = () => {
    if (activeFilter === "all") {
      return Object.entries(articlesMap);
    }
    
    // Only filter once when activeFilter changes
    return Object.entries(articlesMap).filter(([codeId]) => codeId === activeFilter);
  };

  // Memoize sorted articles to improve performance
  const getSortedArticles = (articles: LegalArticle[]) => {
    if (sortOrder === "default") {
      return articles;
    }
    
    return [...articles].sort((a, b) => {
      const aNum = a.numero ? parseInt(a.numero.replace(/\D/g, '')) : 0;
      const bNum = b.numero ? parseInt(b.numero.replace(/\D/g, '')) : 0;
      
      if (sortOrder === "asc") {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    });
  };

  if (totalAudioArticles === 0) {
    return (
      <div className="text-center py-10">
        <VolumeX className="h-10 w-10 mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400">Não há comentários em áudio disponíveis.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      {/* Filter tabs */}
      <div className="mb-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full overflow-x-auto flex flex-nowrap py-2 justify-start md:justify-center">
            <TabsTrigger 
              value="all" 
              onClick={() => setActiveFilter("all")}
              className={activeFilter === "all" ? "bg-law-accent text-white" : ""}
            >
              Todos ({totalAudioArticles})
            </TabsTrigger>
            {Object.entries(articlesMap).map(([codeId, articles]) => {
              if (articles.length === 0) return null;
              
              return (
                <TabsTrigger 
                  key={codeId} 
                  value={codeId}
                  onClick={() => setActiveFilter(codeId)}
                  className={activeFilter === codeId ? "bg-law-accent text-white" : ""}
                >
                  {getCodeTitle(codeId)} ({articles.length})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Sort controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-400">
          {activeFilter === "all" 
            ? `Todos os comentários (${totalAudioArticles})` 
            : `${getCodeTitle(activeFilter)} (${articlesMap[activeFilter]?.length || 0})`}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSortOrder("default")}
            className={sortOrder === "default" ? "text-law-accent" : ""}
          >
            <List className="h-4 w-4 mr-1" />
            Padrão
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSortOrder("asc")}
            className={sortOrder === "asc" ? "text-law-accent" : ""}
          >
            <SkipBack className="h-4 w-4 mr-1 rotate-90" />
            A-Z
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSortOrder("desc")}
            className={sortOrder === "desc" ? "text-law-accent" : ""}
          >
            <SkipForward className="h-4 w-4 mr-1 rotate-90" />
            Z-A
          </Button>
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-8">
        {getFilteredArticles().map(([codeId, articles]) => {
          if (articles.length === 0) return null;
          const sortedArticles = getSortedArticles(articles);
          
          return (
            <Card key={codeId} className="p-4 bg-background-dark border-gray-800">
              <h3 className="text-lg font-serif font-medium text-law-accent mb-4">
                {getCodeTitle(codeId)} ({articles.length})
              </h3>
              
              <div className="space-y-3">
                {sortedArticles.map((article) => (
                  <div 
                    key={article.id} 
                    className={`flex items-center justify-between p-3 rounded-md transition-all ${
                      playingArticleId === article.id?.toString() 
                        ? "bg-law-accent/20 border border-law-accent/30" 
                        : "bg-gray-800/30 hover:bg-gray-800/70 border border-gray-700"
                    }`}
                  >
                    <div className="flex-1">
                      <Link 
                        to={`/codigos/${codeId}?article=${article.id}`}
                        className="text-sm hover:text-law-accent font-medium transition-colors block"
                      >
                        Art. {article.numero || "Sem número"}
                      </Link>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {article.artigo?.substring(0, 100)}...
                      </p>
                      
                      {playingArticleId === article.id?.toString() && (
                        <div className="mt-2 w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                            <Slider
                              className="flex-1"
                              value={[currentTime]}
                              min={0}
                              max={duration}
                              step={0.1}
                              onValueChange={handleSeek}
                            />
                            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {/* Audio controls */}
                      {playingArticleId === article.id?.toString() && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-law-accent"
                                onClick={() => playPreviousAudio(article.id?.toString() || "")}
                              >
                                <SkipBack className="h-4 w-4" />
                                <span className="sr-only">Anterior</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Anterior</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${
                              playingArticleId === article.id?.toString() 
                                ? "text-law-accent" 
                                : ""
                            }`}
                            onClick={() => toggleAudioPlay(
                              article.id?.toString() || "", 
                              article.comentario_audio,
                              codeId,
                              article.numero || "Sem número"
                            )}
                          >
                            {playingArticleId === article.id?.toString() ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {playingArticleId === article.id?.toString() 
                                ? "Pausar comentário" 
                                : "Ouvir comentário"}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {playingArticleId === article.id?.toString() 
                            ? "Pausar comentário" 
                            : "Ouvir comentário"}
                        </TooltipContent>
                      </Tooltip>
                      
                      {playingArticleId === article.id?.toString() && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-law-accent"
                                onClick={() => playNextAudio(article.id?.toString() || "")}
                              >
                                <SkipForward className="h-4 w-4" />
                                <span className="sr-only">Próximo</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Próximo</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400"
                                onClick={() => setIsMinimized(true)}
                              >
                                <Minimize className="h-4 w-4" />
                                <span className="sr-only">Minimizar player</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Minimizar player</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Playback speed controls */}
      {playingArticleId && (
        <div className="mt-6 p-4 bg-background-dark border border-gray-800 rounded-md">
          <h4 className="text-sm font-medium mb-3">Velocidade de reprodução</h4>
          <div className="flex flex-wrap gap-2">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
              <Button 
                key={rate} 
                size="sm"
                variant={playbackRate === rate ? "default" : "outline"}
                className={cn(
                  "min-w-[50px]",
                  playbackRate === rate ? "bg-law-accent" : ""
                )}
                onClick={() => handlePlaybackRateChange(rate)}
              >
                {rate}x
              </Button>
            ))}
          </div>
          
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Volume className="h-4 w-4 text-gray-400" />
              <Slider
                className="flex-1"
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Minimized player */}
      {isMinimized && playingArticleId && globalAudioState.minimalPlayerInfo && (
        <div className="fixed bottom-20 md:bottom-4 left-0 right-0 mx-auto w-[95%] max-w-lg bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-md p-3 shadow-lg animate-fade-in z-30">
          <div className="flex items-center justify-between">
            <div className="flex-1 truncate">
              <h4 className="text-sm font-medium">
                Art. {globalAudioState.minimalPlayerInfo.articleNumber}
              </h4>
              <p className="text-xs text-gray-400">
                {getCodeTitle(globalAudioState.minimalPlayerInfo.codeId)}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => playPreviousAudio(playingArticleId)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-law-accent"
                onClick={() => {
                  if (audioRef.current?.paused) {
                    audioRef.current.play();
                  } else if (audioRef.current) {
                    audioRef.current.pause();
                    setPlayingArticleId(null);
                  }
                }}
              >
                {audioRef.current?.paused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => playNextAudio(playingArticleId)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setIsMinimized(false)}
              >
                <Minimize className="h-4 w-4 rotate-45" />
              </Button>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="h-1 bg-gray-700 rounded-full w-full">
              <div 
                className="h-1 bg-law-accent rounded-full transition-all duration-200" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
};

export default AudioCommentPlaylist;
