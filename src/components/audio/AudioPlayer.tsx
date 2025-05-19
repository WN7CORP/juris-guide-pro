
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume, VolumeX, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  articleId: string;
  audioUrl: string;
  title: string;
  subtitle: string;
  isCurrentPlaying: boolean;
  progress?: number; // Added the progress prop
  onPlay: (articleId: string, audioUrl: string) => void;
  onPause: () => void;
}

const AudioPlayer = ({ 
  articleId, 
  audioUrl, 
  title, 
  subtitle,
  isCurrentPlaying,
  progress = 0, // Provide a default value of 0
  onPlay,
  onPause
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Sync local playing state with parent component's state
  useEffect(() => {
    if (!isCurrentPlaying && isPlaying) {
      setIsPlaying(false);
    }
  }, [isCurrentPlaying]);

  const togglePlayPause = () => {
    if (isCurrentPlaying) {
      if (isPlaying) {
        onPause();
        setIsPlaying(false);
      } else {
        onPlay(articleId, audioUrl);
        setIsPlaying(true);
      }
    } else {
      onPlay(articleId, audioUrl);
      setIsPlaying(true);
    }
  };

  // Update progress when it changes in parent
  useEffect(() => {
    if (!isCurrentPlaying) {
      // No need to reset progress here as it will be controlled by parent
    }
  }, [isCurrentPlaying]);

  // Set error state
  useEffect(() => {
    setAudioError(null);
  }, [audioUrl]);

  return (
    <div 
      className={`flex flex-col p-2 rounded-md transition-colors duration-300 ${
        isCurrentPlaying
          ? 'bg-law-accent/20 border border-law-accent animate-pulse-soft' 
          : 'bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700'
      } cursor-pointer`}
    >
      <div className="flex items-center justify-between" onClick={togglePlayPause}>
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
            <p className="font-medium">{title}</p>
            <p className="text-xs text-gray-400 line-clamp-1">
              {subtitle}
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

      {audioError && (
        <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded-md text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span>Erro: {audioError}</span>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
