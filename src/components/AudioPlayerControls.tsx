
import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Volume1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioPlayerControlsProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  togglePlay: () => void;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

export const AudioPlayerControls = ({
  audioElement,
  isPlaying,
  togglePlay,
  showProgress = true,
  compact = false,
  className
}: AudioPlayerControlsProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  useEffect(() => {
    if (!audioElement) return;
    
    const updateProgress = () => {
      setCurrentTime(audioElement.currentTime || 0);
      setDuration(audioElement.duration || 0);
    };
    
    // Set initial volume
    audioElement.volume = volume;
    
    // Add event listeners
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration);
    });
    
    // Clean up
    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadedmetadata', () => {});
    };
  }, [audioElement, volume]);
  
  const handleSeek = (value: number[]) => {
    if (!audioElement) return;
    
    const newTime = value[0];
    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!audioElement) return;
    
    const newVolume = value[0];
    audioElement.volume = newVolume;
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
  
  return (
    <div className={cn("flex flex-col", className)}>
      {showProgress && (
        <>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full mb-3"
          />
        </>
      )}
      
      <div className="flex items-center justify-between">
        <div className="relative">
          <Button 
            variant="ghost" 
            size={compact ? "sm" : "default"}
            className="h-8 w-8 p-0"
            onClick={() => setShowVolumeControl(!showVolumeControl)}
          >
            <VolumeIcon className="h-4 w-4" />
          </Button>
          
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
        
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} p-0 rounded-full ${isPlaying ? 'bg-law-accent/20 border-law-accent/50' : ''}`}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          ) : (
            <Play className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          )}
        </Button>
        
        <div className={`${compact ? 'w-8' : 'w-10'}`}></div> {/* Spacer for balance */}
      </div>
    </div>
  );
};

export default AudioPlayerControls;
