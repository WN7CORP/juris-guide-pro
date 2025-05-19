
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAudio } from "@/contexts/AudioContext";

interface AudioPlayerProps {
  articleId: string;
  audioUrl: string;
  title: string;
  subtitle: string;
  progress?: number; // This prop is now optional since we use context
}

const AudioPlayer = ({ 
  articleId, 
  audioUrl, 
  title, 
  subtitle,
  progress: externalProgress, // renamed to avoid confusion with context
}: AudioPlayerProps) => {
  const { 
    currentPlayingArticleId,
    isPlaying,
    progress: contextProgress, 
    playAudio,
    pauseAudio
  } = useAudio();
  
  const isCurrentPlaying = currentPlayingArticleId === articleId;
  const currentProgress = isCurrentPlaying ? contextProgress : (externalProgress || 0);

  const togglePlayPause = () => {
    if (isCurrentPlaying) {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio(articleId, audioUrl);
      }
    } else {
      playAudio(articleId, audioUrl);
    }
  };

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
          <Progress value={currentProgress} className="h-1" />
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
