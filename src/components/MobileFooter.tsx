
import { Home, BookOpen, Search, Bookmark, Headphones, Play, Pause, Volume, VolumeX } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { legalCodes } from "@/data/legalCodes";

export const MobileFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioInfo, setCurrentAudioInfo] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Check if audio is playing and update the state
    const checkAudioStatus = () => {
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
    };
    
    // Set up interval to check audio status
    const intervalId = setInterval(checkAudioStatus, 500);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const togglePlay = () => {
    if (!globalAudioState.audioElement) return;
    
    if (globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.play();
      globalAudioState.isPlaying = true;
    } else {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
    }
  };
  
  const navigateToArticle = () => {
    if (!currentAudioInfo) return;
    
    const { codeId, articleId } = currentAudioInfo;
    navigate(`/codigos/${codeId}?article=${articleId}`);
  };
  
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
      {/* Mini audio player that appears when audio is playing */}
      {isAudioPlaying && currentAudioInfo && (
        <div 
          className="fixed bottom-16 left-0 w-full z-20 mini-player footer-audio-player"
          onClick={navigateToArticle}
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
                Art. {currentAudioInfo.articleNumber}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {getCodeTitle(currentAudioInfo.codeId)}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
              >
                {globalAudioState.audioElement?.paused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
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
