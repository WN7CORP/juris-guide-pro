
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume, BookOpen, Search, Bookmark, Home, Headphones, Scale, Gavel, FileText } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState, useMemo } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { legalCodes } from "@/data/legalCodes";
import { motion, AnimatePresence } from "framer-motion";

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

  // Optimized active tab logic with memoization
  const activeTabIndex = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');

    // Define menu items order for index calculation
    const menuItems = [
      { path: "/", label: "Início" },
      { path: "/codigos", label: "Códigos" },
      { path: "/codigos?filter=estatuto", label: "Estatutos" },
      { path: "/audio-comentarios", label: "Comentários" },
      { path: "/codigos?filter=lei", label: "Leis" },
      { path: "/favoritos", label: "Favoritos" }
    ];

    // Home page
    if (currentPath === "/") return 0;

    // Audio comments page
    if (currentPath === "/audio-comentarios") return 3;

    // Favoritos page
    if (currentPath === "/favoritos") return 5;

    // Handle codigos page and filtered versions
    if (currentPath === "/codigos" || currentPath.startsWith("/codigos/")) {
      // If we're on a specific code page, highlight "Códigos"
      if (currentPath.startsWith("/codigos/")) return 1;

      // For /codigos page, check filters
      if (!filter || filter === "código") return 1;
      if (filter === "estatuto") return 2;
      if (filter === "lei") return 4;
    }

    return -1; // No active tab
  }, [currentPath, location.search]);

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
      <header className="sticky top-0 z-20 bg-netflix-bg/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-2 py-2">
          {/* Mini audio player that appears when audio is playing */}
          <AnimatePresence>
            {isAudioPlaying && currentAudioInfo && (
              <motion.div 
                initial={{ y: -40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -40, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mb-2 bg-gradient-to-r from-law-accent/80 to-law-accent/60 backdrop-blur-sm p-2 z-20 rounded-md shadow-lg"
              >
                <div className="flex items-center justify-between max-w-full mx-auto">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-all duration-200" 
                      onClick={togglePlay}
                    >
                      <motion.div
                        animate={globalAudioState.isPlaying ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Volume className="h-4 w-4" />
                      </motion.div>
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
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-all duration-200" 
                      onClick={navigateToArticle}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main navigation */}
          <nav className="relative flex justify-around items-center h-16 overflow-hidden">
            {/* Animated background for active tab */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-law-accent/10 to-law-accent/5 rounded-lg"
              initial={false}
              animate={{
                x: activeTabIndex >= 0 ? `${(activeTabIndex * 100) / menuItems.length}%` : "-100%",
                width: activeTabIndex >= 0 ? `${100 / menuItems.length}%` : "0%",
                opacity: activeTabIndex >= 0 ? 1 : 0
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.6
              }}
            />

            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTabIndex === index;
                
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className="relative flex flex-col items-center justify-center px-4 py-2 z-10 group"
                    >
                      <motion.div
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          animate={isActive ? {
                            scale: [1, 1.2, 1],
                            rotateY: [0, 360],
                          } : {}}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut"
                          }}
                        >
                          <Icon 
                            className={cn(
                              "h-5 w-5 transition-all duration-300",
                              isActive 
                                ? "text-law-accent drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]" 
                                : "text-gray-400 group-hover:text-gray-300"
                            )} 
                          />
                        </motion.div>
                        
                        <motion.span 
                          className={cn(
                            "text-xs mt-1 font-medium transition-all duration-300",
                            isActive 
                              ? "text-law-accent font-semibold" 
                              : "text-gray-400 group-hover:text-gray-300"
                          )}
                          animate={isActive ? {
                            y: [0, -2, 0],
                          } : {}}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          {item.label}
                        </motion.span>
                      </motion.div>
                      
                      {/* Animated highlight bar for active tab */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute -bottom-2 left-1/2 w-12 h-1 bg-gradient-to-r from-law-accent to-netflix-red rounded-full"
                            initial={{ opacity: 0, scale: 0.8, x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                              duration: 0.5
                            }}
                          />
                        )}
                      </AnimatePresence>
                      
                      {/* Audio playing indicator with pulse animation */}
                      <AnimatePresence>
                        {item.path === "/audio-comentarios" && isAudioPlaying && (
                          <motion.span 
                            className="absolute top-3 right-[calc(50%-12px)] h-1.5 w-1.5 rounded-full bg-red-500"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: [0, 1.2, 1],
                              opacity: [0, 1, 1]
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              duration: 0.3,
                              repeat: Infinity,
                              repeatType: "reverse",
                              repeatDelay: 0.5
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="mb-1">
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.div>
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
