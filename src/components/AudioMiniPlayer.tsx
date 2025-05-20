import { useEffect, useRef, useState } from "react";
import { Play, Pause, X, Minimize2, Volume2, Volume1, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { getAudio, preloadAudio } from "@/services/audioPreloadService";
interface AudioMiniPlayerProps {
  audioUrl: string;
  articleId: string;
  articleNumber?: string;
  onClose: () => void;
  onMinimize: () => void;
}
const AudioMiniPlayer = ({
  audioUrl,
  articleId,
  articleNumber,
  onClose,
  onMinimize
}: AudioMiniPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Tentar obter o áudio do cache ou pré-carregá-lo
        let audio = getAudio(audioUrl);

        // Se não estiver em cache, aguarde o pré-carregamento
        if (!audio) {
          audio = await preloadAudio(audioUrl);
        }

        // Configurar o áudio
        audio.volume = volume;

        // Configurar eventos
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio!.duration);
        });
        audio.addEventListener('ended', handleAudioEnded);
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audioRef.current = audio;

        // Update global audio state
        globalAudioState.audioElement = audio;
        globalAudioState.currentAudioId = articleId;

        // Set minimal player info for the footer player
        globalAudioState.minimalPlayerInfo = {
          articleId,
          articleNumber,
          codeId: new URLSearchParams(window.location.search).get('codeId') || window.location.pathname.split('/').filter(Boolean)[1] || '',
          audioUrl
        };

        // Play the audio after it's loaded
        audio.play().catch(err => {
          console.error("Failed to play audio:", err);
        });
      } catch (error) {
        console.error("Failed to set up audio:", error);
      }
    };
    setupAudio();
    return () => {
      // Clean up on unmount
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('pause', () => {});

        // Pause audio on unmount if playing
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }

        // Reset global audio state if this player is controlling it
        if (globalAudioState.currentAudioId === articleId) {
          globalAudioState.currentAudioId = "";
          globalAudioState.audioElement = null;
        }
      }
    };
  }, [audioUrl, articleId, articleNumber, volume]);
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    // Reset global audio state
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
  };
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      globalAudioState.isPlaying = true;
    } else {
      audioRef.current.pause();
      globalAudioState.isPlaying = false;
    }
  };
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Select the volume icon based on current volume
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  return <TooltipProvider>
      <div className="bg-gray-900/95 border border-gray-800 rounded-lg p-3 shadow-lg w-full max-w-xs animate-in fade-in py-[22px] mx-0 my-[48px]">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium text-sm text-law-accent">
            {articleNumber ? `Art. ${articleNumber} - Comentário` : 'Comentário em Áudio'}
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onMinimize}>
                  <Minimize2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Minimizar</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
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
          
          <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="w-full" />
          
          <div className="flex items-center justify-between">
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowVolumeControl(!showVolumeControl)}>
                    <VolumeIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Volume</TooltipContent>
              </Tooltip>
              
              {showVolumeControl && <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-md border border-gray-700 w-32 z-10">
                  <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-full" />
                </div>}
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className={`h-10 w-10 p-0 rounded-full ${isPlaying ? 'bg-law-accent/20 border-law-accent/50' : ''}`} onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Pausar' : 'Reproduzir'}</TooltipContent>
            </Tooltip>
            
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>
    </TooltipProvider>;
};
export default AudioMiniPlayer;