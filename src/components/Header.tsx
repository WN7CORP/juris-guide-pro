
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume, BookOpen, Search, Bookmark, Home, Headphones, Scale, Gavel } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { legalCodes } from "@/data/legalCodes";

export const Header = () => {
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

  const menuItems = [{
    icon: Home,
    label: "Início",
    path: "/"
  }, {
    icon: BookOpen,
    label: "Códigos",
    path: "/codigos"
  }, {
    icon: Search,
    label: "Pesquisar",
    path: "/pesquisar"
  }, {
    icon: Headphones,
    label: "Comentários",
    path: "/audio-comentarios",
    isActive: (path: string) => {
      return path === "/audio-comentarios" || isAudioPlaying;
    }
  }, {
    icon: Bookmark,
    label: "Favoritos",
    path: "/favoritos"
  }];

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 bg-netflix-bg border-b border-gray-800">
        <div className="container mx-auto px-2 py-2">
          {/* Mini audio player that appears when audio is playing */}
          {isAudioPlaying && currentAudioInfo && (
            <div className="mb-2 bg-law-accent/90 backdrop-blur-sm p-2 z-20 rounded-md">
              <div className="flex items-center justify-between max-w-full mx-auto">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-white" 
                    onClick={togglePlay}
                  >
                    {globalAudioState.isPlaying ? (
                      <Volume className="h-4 w-4" />
                    ) : (
                      <Volume className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <div className="text-xs text-white truncate max-w-[150px]">
                    <div className="font-medium truncate">
                      {currentAudioInfo.articleNumber ? `Art. ${currentAudioInfo.articleNumber}` : 'Comentário'}
                    </div>
                    <div className="opacity-80 text-[10px] truncate">
                      {getCodeTitle(currentAudioInfo.codeId)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-xs text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-white" 
                    onClick={navigateToArticle}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main navigation */}
          <nav className="flex justify-around items-center h-16">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive 
                ? item.isActive(currentPath) 
                : currentPath === item.path;
                
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex flex-col items-center justify-center px-4 py-2",
                        isActive ? "text-law-accent" : "text-gray-400 hover:text-gray-300"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs mt-1">{item.label}</span>
                      
                      {/* Indicator dot for currently playing audio */}
                      {item.path === "/audio-comentarios" && isAudioPlaying && (
                        <span className="absolute top-3 right-[calc(50%-12px)] h-1.5 w-1.5 rounded-full bg-red-500"></span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="mb-1">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
