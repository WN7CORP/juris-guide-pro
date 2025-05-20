
import { Home, BookOpen, Search, Bookmark, Headphones, Play, Pause } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { legalCodes } from "@/data/legalCodes";

// Use memo for better performance
const AudioMiniInfo = memo(({ info, onNavigate, currentTime, duration, isPlaying, onTogglePlay }: any) => {
  // Format time in MM:SS format
  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Find the code name based on ID
  const getCodeTitle = (codeId: string): string => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : "Código";
  };
  
  if (!info) return null;
  
  return (
    <div 
      className="fixed bottom-16 left-0 w-full z-20 mini-player footer-audio-player"
      onClick={onNavigate}
    >
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${(currentTime / (duration || 1)) * 100}%` 
          }}
        />
      </div>
      
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-2">
          <div className="text-sm font-medium truncate">
            Art. {info.articleNumber}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {getCodeTitle(info.codeId)}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
          >
            {!isPlaying ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

AudioMiniInfo.displayName = 'AudioMiniInfo';

export const MobileFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioInfo, setCurrentAudioInfo] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Use callback for better performance
  const checkAudioStatus = useCallback(() => {
    const isPlaying = !!globalAudioState.currentAudioId;
    setIsAudioPlaying(isPlaying);
    
    if (isPlaying && globalAudioState.minimalPlayerInfo) {
      setCurrentAudioInfo(globalAudioState.minimalPlayerInfo);
    } else {
      setCurrentAudioInfo(null);
    }
    
    // Update time and duration if audio is playing
    if (isPlaying && globalAudioState.audioElement) {
      setCurrentTime(globalAudioState.audioElement.currentTime || 0);
      setDuration(globalAudioState.audioElement.duration || 0);
    }
  }, []);
  
  useEffect(() => {
    // Set up listeners for audio events instead of using an interval
    const handleTimeUpdate = () => {
      if (globalAudioState.audioElement) {
        setCurrentTime(globalAudioState.audioElement.currentTime);
      }
    };
    
    const handleDurationChange = () => {
      if (globalAudioState.audioElement) {
        setDuration(globalAudioState.audioElement.duration);
      }
    };
    
    const handlePlay = () => {
      setIsAudioPlaying(true);
      checkAudioStatus();
    };
    
    const handlePause = () => {
      setIsAudioPlaying(false);
    };
    
    const handleEnded = () => {
      setIsAudioPlaying(false);
      setCurrentAudioInfo(null);
    };
    
    // Initial check
    checkAudioStatus();
    
    // Add event listeners to the global audio element
    if (globalAudioState.audioElement) {
      globalAudioState.audioElement.addEventListener('timeupdate', handleTimeUpdate);
      globalAudioState.audioElement.addEventListener('durationchange', handleDurationChange);
      globalAudioState.audioElement.addEventListener('play', handlePlay);
      globalAudioState.audioElement.addEventListener('pause', handlePause);
      globalAudioState.audioElement.addEventListener('ended', handleEnded);
    }
    
    // Check audio status on path change
    const unlisten = window.addEventListener('popstate', checkAudioStatus);
    
    // Set up a less frequent interval as a fallback
    const intervalId = setInterval(checkAudioStatus, 2000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('popstate', checkAudioStatus);
      
      if (globalAudioState.audioElement) {
        globalAudioState.audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        globalAudioState.audioElement.removeEventListener('durationchange', handleDurationChange);
        globalAudioState.audioElement.removeEventListener('play', handlePlay);
        globalAudioState.audioElement.removeEventListener('pause', handlePause);
        globalAudioState.audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, [checkAudioStatus]);
  
  const togglePlay = useCallback(() => {
    if (!globalAudioState.audioElement) return;
    
    if (globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.play();
      globalAudioState.isPlaying = true;
    } else {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
    }
  }, []);
  
  const navigateToArticle = useCallback(() => {
    if (!currentAudioInfo) return;
    
    const { codeId, articleId } = currentAudioInfo;
    navigate(`/codigos/${codeId}?article=${articleId}`);
  }, [currentAudioInfo, navigate]);

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: BookOpen, label: "Códigos", path: "/codigos" },
    { icon: Search, label: "Pesquisar", path: "/pesquisar" },
    { 
      icon: Headphones, 
      label: "Comentários", 
      path: "/audio-comentarios",
      isActive: (path: string) => {
        return path === "/audio-comentarios" || isAudioPlaying;
      }
    },
    { icon: Bookmark, label: "Favoritos", path: "/favoritos" },
  ];

  return (
    <TooltipProvider>
      {/* Use memoized audio info component */}
      {isAudioPlaying && currentAudioInfo && (
        <AudioMiniInfo 
          info={currentAudioInfo}
          onNavigate={navigateToArticle}
          currentTime={currentTime}
          duration={duration}
          isPlaying={!globalAudioState.audioElement?.paused}
          onTogglePlay={togglePlay}
        />
      )}

      {/* Main footer navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-netflix-bg border-t border-gray-800 shadow-lg md:hidden z-10">
        <nav className="flex justify-around items-center py-2">
          {menuItems.map((item) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-md transition-colors",
                    item.isActive 
                      ? item.isActive(currentPath)
                        ? "text-netflix-red font-medium"
                        : "text-gray-400"
                      : currentPath === item.path
                        ? "text-netflix-red font-medium"
                        : "text-gray-400",
                    // Add pulse animation if audio is playing
                    item.path === "/audio-comentarios" && isAudioPlaying && currentPath !== "/audio-comentarios"
                      ? "animate-pulse"
                      : ""
                  )}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </footer>
    </TooltipProvider>
  );
};

export default MobileFooter;
