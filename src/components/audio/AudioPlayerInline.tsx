
import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/AudioContext";
import { formatTime } from "@/utils/formatTime";

interface AudioPlayerInlineProps {
  articleId: string;
  audioUrl: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const AudioPlayerInline = ({
  articleId,
  audioUrl,
  title = "Comentário de áudio",
  onClose,
  className,
}: AudioPlayerInlineProps) => {
  const { 
    currentPlayingArticleId,
    isPlaying,
    progress,
    duration,
    playAudio,
    pauseAudio,
    seekTo
  } = useAudio();
  
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);
  
  const isCurrentArticle = currentPlayingArticleId === articleId;

  useEffect(() => {
    // Calculate current time based on progress percentage
    if (isCurrentArticle && duration > 0) {
      setCurrentTime((progress / 100) * duration);
      setTotalDuration(duration);
    }
  }, [progress, isCurrentArticle, duration]);

  // Create animated waveform visualization
  useEffect(() => {
    if (!waveformRef.current) return;
    
    const waveformBars = waveformRef.current.querySelectorAll('.waveform-bar');
    const animateBars = () => {
      if (!isCurrentArticle || !isPlaying) return;
      
      waveformBars.forEach((bar, index) => {
        const element = bar as HTMLElement;
        // Create a random animation based on the index
        const height = 20 + Math.random() * 60;
        element.style.height = `${height}%`;
        element.style.transition = `height ${300 + (index % 3) * 100}ms ease`;
      });
      
      animationRef.current = requestAnimationFrame(animateBars);
    };
    
    const animationRef = { current: 0 };
    
    if (isCurrentArticle && isPlaying) {
      animationRef.current = requestAnimationFrame(animateBars);
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isCurrentArticle, isPlaying]);

  const handlePlayPause = async () => {
    if (!audioUrl) return;
    
    try {
      setLoading(true);
      
      if (isCurrentArticle && isPlaying) {
        pauseAudio();
      } else {
        await playAudio(articleId, audioUrl);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  // Generate waveform bars
  const renderWaveformBars = () => {
    const bars = [];
    const barCount = 28; // Number of bars in the waveform
    
    for (let i = 0; i < barCount; i++) {
      const initialHeight = 10 + Math.random() * 40;
      const isActive = (i / barCount) * 100 <= progress;
      
      bars.push(
        <div
          key={i}
          className={cn(
            "waveform-bar w-1 rounded-sm transition-all",
            isCurrentArticle && isPlaying 
              ? "animate-pulse-slow" 
              : "",
            isActive 
              ? "bg-law-accent" 
              : "bg-gray-700"
          )}
          style={{
            height: `${initialHeight}%`,
          }}
        />
      );
    }
    
    return bars;
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col p-4 mt-4 mb-6 rounded-lg border transition-all",
        isCurrentArticle && isPlaying 
          ? "border-law-accent/50 bg-law-accent/10" 
          : "border-gray-700 bg-gray-800/50",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full flex-shrink-0 transition-colors",
              isCurrentArticle && isPlaying
                ? "bg-law-accent text-white border-transparent hover:bg-law-accent/80"
                : "border-gray-600 text-law-accent hover:bg-law-accent/10"
            )}
            disabled={loading}
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isCurrentArticle && isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <div>
            <h4 className="font-medium text-white">{title}</h4>
            <p className="text-xs text-gray-300">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentArticle && isPlaying ? (
            <Volume2 className="h-4 w-4 text-law-accent" />
          ) : (
            <VolumeX className="h-4 w-4 text-gray-400" />
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-700"
              onClick={onClose}
              aria-label="Fechar reprodutor"
            >
              <span className="sr-only">Fechar</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          )}
        </div>
      </div>
      
      {/* Slider for seeking */}
      <div className="mb-3">
        <Slider 
          value={[progress]} 
          min={0} 
          max={100} 
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
          aria-label="Posição do áudio"
        />
      </div>
      
      {/* Animated waveform visualization */}
      <div 
        ref={waveformRef}
        className="flex items-end gap-1 h-12 mt-1"
      >
        {renderWaveformBars()}
      </div>
    </div>
  );
};

export default AudioPlayerInline;
