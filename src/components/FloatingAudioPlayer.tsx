
import { useEffect, useState, useRef, memo } from 'react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { globalAudioState } from '@/components/AudioCommentPlaylist';
import { cn } from '@/lib/utils';

interface FloatingAudioPlayerProps {
  className?: string;
}

// Use memo to prevent unnecessary re-renders
const FloatingAudioPlayer = memo(({ className }: FloatingAudioPlayerProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [info, setInfo] = useState<any>(null);
  const timeoutRef = useRef<any>(null);

  // Check if audio is currently playing
  useEffect(() => {
    const checkAudioStatus = () => {
      const isAudioPlaying = !!globalAudioState.currentAudioId && 
                            globalAudioState.audioElement && 
                            !globalAudioState.audioElement.paused;
      
      setIsPlaying(isAudioPlaying);
      
      if (globalAudioState.minimalPlayerInfo) {
        setInfo(globalAudioState.minimalPlayerInfo);
      }
      
      if (isAudioPlaying && globalAudioState.audioElement) {
        setCurrentTime(globalAudioState.audioElement.currentTime || 0);
        setDuration(globalAudioState.audioElement.duration || 0);
      }
    };
    
    checkAudioStatus();
    
    // Add event listeners to update state when audio changes
    const handleTimeUpdate = () => {
      if (globalAudioState.audioElement) {
        setCurrentTime(globalAudioState.audioElement.currentTime);
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      setIsExpanded(true);
      
      // Auto-collapse after 5 seconds if playing
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    if (globalAudioState.audioElement) {
      globalAudioState.audioElement.addEventListener('timeupdate', handleTimeUpdate);
      globalAudioState.audioElement.addEventListener('play', handlePlay);
      globalAudioState.audioElement.addEventListener('pause', handlePause);
    }
    
    // Set up interval for regular updates
    const intervalId = setInterval(checkAudioStatus, 1000);
    
    return () => {
      if (globalAudioState.audioElement) {
        globalAudioState.audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        globalAudioState.audioElement.removeEventListener('play', handlePlay);
        globalAudioState.audioElement.removeEventListener('pause', handlePause);
      }
      
      clearInterval(intervalId);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // No audio playing, don't render
  if (!info || !globalAudioState.currentAudioId) return null;
  
  // Format time in MM:SS
  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const togglePlay = () => {
    if (!globalAudioState.audioElement) return;
    
    if (globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.play();
      globalAudioState.isPlaying = true;
      
      // Auto-collapse after 5 seconds when playing
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
    } else {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
      
      // Clear auto-collapse timeout when paused
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };
  
  const handleClose = () => {
    if (globalAudioState.audioElement) {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
      globalAudioState.currentAudioId = "";
      globalAudioState.minimalPlayerInfo = null;
    }
  };
  
  return (
    <div 
      className={cn(
        "fixed z-40 transition-all duration-300",
        isExpanded 
          ? "bottom-6 right-6 w-64 bg-gray-900/95 rounded-lg shadow-lg border border-gray-700"
          : "bottom-6 right-6 w-12 h-12 rounded-full bg-law-accent shadow-lg",
        className
      )}
    >
      {isExpanded ? (
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium truncate text-white">
              {info.articleNumber ? `Art. ${info.articleNumber}` : 'Áudio comentário'}
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setIsExpanded(false)}
              >
                <Volume2 className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={handleClose}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {/* Progress bar */}
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-law-accent"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          className="w-full h-full flex items-center justify-center text-white"
          onClick={() => setIsExpanded(true)}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
});

FloatingAudioPlayer.displayName = 'FloatingAudioPlayer';

export default FloatingAudioPlayer;
