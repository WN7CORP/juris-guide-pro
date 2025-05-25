import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume, BookOpen, Search, Bookmark, Home, Headphones, Scale, Gavel, FileText } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { legalCodes } from "@/data/legalCodes";
import { motion } from "framer-motion";

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

  // Improved active tab logic to ensure only one tab is active at a time
  const getIsActive = (itemPath: string, itemLabel: string): boolean => {
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');

    // Handle home page
    if (itemPath === "/" && currentPath === "/") {
      return true;
    }

    // Handle audio comments page
    if (itemPath === "/audio-comentarios") {
      return currentPath === "/audio-comentarios";
    }

    // Handle favoritos page
    if (itemPath === "/favoritos") {
      return currentPath === "/favoritos";
    }

    // Handle codigos page and filtered versions
    if (currentPath === "/codigos" || currentPath.startsWith("/codigos/")) {
      // If we're on a specific code page, only highlight "Códigos"
      if (currentPath.startsWith("/codigos/")) {
        return itemLabel === "Códigos";
      }

      // For /codigos page, check filters
      if (itemPath === "/codigos" && itemLabel === "Códigos") {
        return !filter || filter === "código";
      }
      
      if (itemPath === "/codigos?filter=estatuto" && itemLabel === "Estatutos") {
        return filter === "estatuto";
      }
      
      if (itemPath === "/codigos?filter=lei" && itemLabel === "Leis") {
        return filter === "lei";
      }
    }

    return false;
  };

  const menuItems = [{
    icon: Home,
    label: "Início",
    path: "/"
  }, {
    icon: Scale,
    label: "Códigos",
    path: "/codigos"
  }, {
    icon: Gavel,
    label: "Estatutos",
    path: "/codigos?filter=estatuto"
  }, {
    icon: Headphones,
    label: "Comentários",
    path: "/audio-comentarios"
  }, {
    icon: FileText,
    label: "Leis",
    path: "/codigos?filter=lei"
  }, {
    icon: Bookmark,
    label: "Favoritos",
    path: "/favoritos"
  }];

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 bg-netflix-bg border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-2 py-2">
          {/* Mini audio player that appears when audio is playing */}
          {isAudioPlaying && currentAudioInfo && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mb-2 bg-gradient-to-r from-law-accent/80 to-law-accent/60 backdrop-blur-sm p-2 z-20 rounded-md shadow-lg"
            >
              <div className="flex items-center justify-between max-w-full mx-auto">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-white hover:bg-white/20" 
                    onClick={togglePlay}
                  >
                    {globalAudioState.isPlaying ? (
                      <Volume className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Volume className="h-4 w-4 text-gray-300" />
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
                    className="h-8 w-8 p-0 text-white hover:bg-white/20" 
                    onClick={navigateToArticle}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main navigation */}
          <nav className="relative flex justify-around items-center h-16">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = getIsActive(item.path, item.label);
                
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "relative flex flex-col items-center justify-center px-4 py-2 transition-all duration-300",
                        isActive 
                          ? "text-law-accent scale-110" 
                          : "text-gray-400 hover:text-gray-300 hover:scale-105"
                      )}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'drop-shadow-[0_0_3px_rgba(229,9,20,0.5)]' : ''}`} />
                      <span className="text-xs mt-1 font-medium">{item.label}</span>
                      
                      {/* Animated highlight bar for active tab */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-law-accent rounded-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      )}
                      
                      {/* Indicator dot for currently playing audio */}
                      {item.path === "/audio-comentarios" && isAudioPlaying && (
                        <span className="absolute top-3 right-[calc(50%-12px)] h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
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
