
import { useState } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { AudioArticle } from "@/pages/AudioComments";

interface AudioPlayerControlsProps {
  article: AudioArticle;
  isMobile?: boolean;
}

const AudioPlayerControls = ({ article, isMobile = false }: AudioPlayerControlsProps) => {
  const articleId = `${article.codeId}-${article.id}`;
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
    articleNumber: article.numero,
    codeId: article.codeId,
    audioUrl: article.comentario_audio,
    autoPlay: true
  });

  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showSpeedControl, setShowSpeedControl] = useState(false);

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

  if (isMobile) {
    return (
      <div className="flex-1 bg-netflix-dark flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6 w-full max-w-sm">
            {/* Large Play Button */}
            <div className="flex justify-center">
              <Button
                onClick={togglePlay}
                size="lg"
                className="h-20 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {isPlaying ? 'Reproduzindo' : 'Pronto para ouvir'}
              </h3>
              <p className="text-sm text-gray-400">
                {isPlaying ? 'Toque para pausar' : 'Toque para reproduzir o comentário'}
              </p>
            </div>

            {/* Time Display */}
            <div className="text-center">
              <div className="text-2xl font-mono text-cyan-400 mb-1">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-400">
                de {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="bg-netflix-dark border-t border-gray-700 p-3 space-y-3 flex-shrink-0">
          {/* Progress Bar */}
          <div>
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

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-10)}
              className="text-gray-300 hover:text-white hover:bg-gray-700 h-10 w-10 p-0"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={togglePlay}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-full h-12 w-12 p-0"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(10)}
              className="text-gray-300 hover:text-white hover:bg-gray-700 h-10 w-10 p-0"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Speed Control */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSpeedControl(!showSpeedControl)}
                className="text-gray-300 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 text-xs"
              >
                {playbackSpeed}x
              </Button>
              
              {showSpeedControl && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
                  <div className="flex flex-col gap-1 min-w-[60px]">
                    {speedOptions.map(speed => (
                      <Button
                        key={speed}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedControl(false);
                        }}
                        className={`text-xs justify-center hover:bg-gray-700 ${playbackSpeed === speed ? 'text-cyan-400' : 'text-gray-300'}`}
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
                variant="outline"
                size="sm"
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="text-gray-300 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 h-8 w-8 p-0"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              
              {showVolumeControl && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
                  <div className="w-20">
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
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex-1 p-4 flex flex-col justify-center">
      {/* Progress and Time */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
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
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => skipTime(-10)}
          className="text-gray-400 hover:text-white hover:bg-gray-700 h-8 w-8 p-0"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={togglePlay}
          size="sm"
          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-full h-12 w-12 p-0"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => skipTime(10)}
          className="text-gray-400 hover:text-white hover:bg-gray-700 h-8 w-8 p-0"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        <p className="text-sm text-white font-medium mb-1">
          {isPlaying ? 'Reproduzindo' : 'Pronto'}
        </p>
        <p className="text-xs text-gray-400">
          {isPlaying ? 'Reproduzindo comentário...' : 'Clique para ouvir'}
        </p>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Speed Control */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSpeedControl(!showSpeedControl)}
            className="text-gray-400 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 text-xs"
          >
            {playbackSpeed}x
          </Button>
          
          {showSpeedControl && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
              <div className="flex flex-col gap-1 min-w-[60px]">
                {speedOptions.map(speed => (
                  <Button
                    key={speed}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      setShowSpeedControl(false);
                    }}
                    className={`text-xs justify-center hover:bg-gray-700 ${playbackSpeed === speed ? 'text-cyan-400' : 'text-gray-400'}`}
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
            variant="outline"
            size="sm"
            onClick={() => setShowVolumeControl(!showVolumeControl)}
            className="text-gray-400 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 h-8 w-8 p-0"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          
          {showVolumeControl && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
              <div className="w-20">
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
    </div>
  );
};

export default AudioPlayerControls;
