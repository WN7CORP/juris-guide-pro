import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, X, Minimize2, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { globalAudioState } from "./AudioCommentPlaylist";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface AudioMiniPlayerProps {
  audioUrl: string;
  articleId: string;
  articleNumber?: string;
  codeId?: string;
  onClose: () => void;
  onMinimize: () => void;
  autoPlay?: boolean;
}

const AudioMiniPlayer = ({
  audioUrl,
  articleId,
  articleNumber,
  codeId,
  onClose,
  onMinimize,
  autoPlay = false
}: AudioMiniPlayerProps) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    togglePlay,
    seek,
    setVolume: setAudioVolume,
    setPlaybackSpeed
  } = useAudioPlayer({
    articleId,
    articleNumber,
    codeId,
    audioUrl,
    autoPlay: false // Never auto-play from mini player to avoid conflicts
  });

  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showSpeedControl, setShowSpeedControl] = useState(false);

  // Manual auto-play handling with better control
  useEffect(() => {
    if (autoPlay && !isPlaying) {
      // Small delay and check if no other audio is playing
      const timer = setTimeout(() => {
        if (globalAudioState.currentAudioId === "" || globalAudioState.currentAudioId === articleId) {
          console.log(`Mini player triggering play for ${articleId}`);
          togglePlay();
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, articleId]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setAudioVolume(value[0]);
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seek(newTime);
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Handle close with proper cleanup
  const handleClose = () => {
    console.log(`Mini player close requested for ${articleId}`);
    if (isPlaying) {
      togglePlay(); // This will pause the audio
    }
    onClose();
  };

  // Handle minimize without stopping audio
  const handleMinimize = () => {
    console.log(`Mini player minimize requested for ${articleId}`);
    onMinimize();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <Card className="bg-gray-900 border-gray-700 shadow-2xl">
        <CardContent className="p-3 md:p-4 bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-2 rounded-full bg-law-accent/20 flex-shrink-0">
                <Volume2 className="h-4 w-4 text-law-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  Comentário - Art. {articleNumber}
                </p>
                <p className="text-xs text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-10)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <SkipBack className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 md:h-10 md:w-10 p-0 rounded-full bg-law-accent/20 border-law-accent/50 hover:bg-law-accent/30"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3 md:h-4 md:w-4 text-law-accent" />
                ) : (
                  <Play className="h-3 w-3 md:h-4 md:w-4 text-law-accent ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(10)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <SkipForward className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpeedControl(!showSpeedControl)}
                className="text-xs text-gray-400 hover:text-white min-w-[32px] md:min-w-[40px] hover:bg-gray-700"
              >
                {playbackSpeed}x
              </Button>
              
              {showSpeedControl && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20">
                  <div className="flex flex-col gap-1 min-w-[80px]">
                    {speedOptions.map(speed => (
                      <Button
                        key={speed}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedControl(false);
                        }}
                        className={`text-xs justify-center hover:bg-gray-700 ${playbackSpeed === speed ? 'text-law-accent' : 'text-gray-400'}`}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Volume Control */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              
              {showVolumeControl && (
                <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20">
                  <div className="w-20 md:w-24">
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-gray-400 mt-1">
                      {Math.round(volume * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioMiniPlayer;
