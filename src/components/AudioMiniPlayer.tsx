
import { useEffect, useRef, useState, memo } from "react";
import { Play, Pause, X, Minimize2, Volume2, Volume1, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";

interface AudioMiniPlayerProps {
  audioUrl: string;
  articleId: string;
  articleNumber?: string;
  onClose: () => void;
  onMinimize: () => void;
}

// Use memo to prevent unnecessary re-renders
const AudioMiniPlayer = memo(({
  audioUrl,
  articleId,
  articleNumber,
  onClose,
  onMinimize,
}: AudioMiniPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Setup audio element only once
  useEffect(() => {
    // Create the audio element only if it doesn't exist or URL changed
    if (!audioRef.current || audioRef.current.src !== audioUrl) {
      // Clean up any existing audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
      
      const audio = new Audio();
      
      // Set properties before loading source to reduce reflows
      audio.preload = 'metadata';
      audio.volume = volume;
      
      // Set up audio event listeners
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        if (globalAudioState.currentAudioId === articleId) {
          globalAudioState.currentAudioId = "";
          globalAudioState.isPlaying = false;
        }
      };
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleError = (e: Event) => {
        console.error("Audio playback error:", e);
        setAudioError("Erro na reprodução de áudio");
        setIsPlaying(false);
        if (globalAudioState.currentAudioId === articleId) {
          globalAudioState.currentAudioId = "";
          globalAudioState.isPlaying = false;
        }
      };
      
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);
      
      // Now set the source and load
      audio.src = audioUrl;
      audio.load();
      
      audioRef.current = audio;
      
      // Update global audio state
      globalAudioState.audioElement = audio;
      globalAudioState.currentAudioId = articleId;
      
      // Set minimal player info for the footer player
      globalAudioState.minimalPlayerInfo = {
        articleId,
        articleNumber,
        codeId: new URLSearchParams(window.location.search).get('codeId') || 
                window.location.pathname.split('/').filter(Boolean)[1] || '',
        audioUrl
      };
      
      // Play the audio after it's loaded
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Failed to play audio:", err);
          setAudioError("Falha ao iniciar a reprodução");
        });
      }
      
      // Clean up function to remove all event listeners
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
        
        audio.pause();
        audio.src = '';
        
        // Reset global audio state if this player is controlling it
        if (globalAudioState.currentAudioId === articleId) {
          globalAudioState.currentAudioId = "";
          globalAudioState.audioElement = null;
        }
      };
    }
  }, [audioUrl, articleId, articleNumber]);
  
  // Update volume only when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Failed to play audio:", err);
          setAudioError("Falha ao iniciar a reprodução");
        });
      }
      globalAudioState.isPlaying = true;
    } else {
      audioRef.current.pause();
      globalAudioState.isPlaying = false;
    }
  };
  
  // Seek to position
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Change volume
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };
  
  // Format time display
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Select the volume icon based on current volume
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  
  // Render error state if there's an error
  if (audioError) {
    return (
      <TooltipProvider>
        <div className="bg-gray-900/95 border border-red-800 rounded-lg p-3 shadow-lg w-full max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-sm text-red-400">
              Erro na reprodução
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-sm text-gray-300 mb-3">{audioError}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setAudioError(null);
              if (audioRef.current) {
                const newAudio = new Audio(audioUrl);
                audioRef.current = newAudio;
                const playPromise = newAudio.play();
                if (playPromise !== undefined) {
                  playPromise.catch(() => {
                    setAudioError("Não foi possível reproduzir o áudio.");
                  });
                }
              }
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="bg-gray-900/95 border border-gray-800 rounded-lg p-3 shadow-lg w-full max-w-xs animate-in fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium text-sm text-law-accent">
            {articleNumber ? `Art. ${articleNumber} - Comentário` : 'Comentário em Áudio'}
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={onMinimize}
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Minimizar</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={onClose}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fechar</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          
          <div className="flex items-center justify-between">
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowVolumeControl(!showVolumeControl)}
                  >
                    <VolumeIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Volume</TooltipContent>
              </Tooltip>
              
              {showVolumeControl && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-md border border-gray-700 w-32 z-10">
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
              )}
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-10 w-10 p-0 rounded-full ${isPlaying ? 'bg-law-accent/20 border-law-accent/50' : ''}`}
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Pausar' : 'Reproduzir'}</TooltipContent>
            </Tooltip>
            
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});

AudioMiniPlayer.displayName = 'AudioMiniPlayer';

export default AudioMiniPlayer;
