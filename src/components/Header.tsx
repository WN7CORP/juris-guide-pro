import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume, BookOpen, Scale, Gavel, FileText, Home, Headphones, Bookmark } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState, useMemo, useCallback } from "react";
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

  // Simplified menu items array with corrected navigation logic
  const menuItems = useMemo(() => [
    { icon: Home, label: "Início", path: "/" },
    { icon: Scale, label: "Códigos", path: "/codigos" },
    { icon: Gavel, label: "Estatutos", path: "/codigos?filter=estatuto" },
    { icon: Headphones, label: "Comentários", path: "/audio-comentarios" },
    { icon: FileText, label: "Leis", path: "/codigos?filter=lei" },
    { icon: Bookmark, label: "Favoritos", path: "/favoritos" }
  ], []);

  // Fixed active tab logic with proper filter detection
  const getActiveTabIndex = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');

    // Direct path matching first
    if (currentPath === "/") return 0;
    if (currentPath === "/audio-comentarios") return 3;
    if (currentPath === "/favoritos") return 5;
    
    // Handle codigos page with proper filter logic
    if (currentPath === "/codigos") {
      // Check for filters
      if (filter === "estatuto") return 2; // Estatutos tab
      if (filter === "lei") return 4; // Leis tab
      return 1; // Default códigos tab (no filter or filter=código)
    }
    
    // Handle specific code pages (like /codigos/codigo-civil)
    if (currentPath.startsWith("/codigos/")) {
      return 1; // Always show códigos as active for specific code pages
    }

    return -1; // No active tab
  }, [currentPath, location.search]);

  const activeTabIndex = getActiveTabIndex();

  // Handle navigation with proper URL construction
  const handleNavigation = useCallback((item: typeof menuItems[0], index: number) => {
    // For códigos navigation, ensure we clear any existing filters
    if (index === 1) { // Códigos tab
      navigate("/codigos");
    } else {
      // For other items, navigate directly to their path
      navigate(item.path);
    }
  }, [navigate]);

  useEffect(() => {
    const checkAudioStatus = () => {
      const isPlaying = !!globalAudioState.currentAudioId;
      setIsAudioPlaying(isPlaying);
      if (isPlaying && globalAudioState.minimalPlayerInfo) {
        setCurrentAudioInfo(globalAudioState.minimalPlayerInfo);
      } else {
        setCurrentAudioInfo(null);
      }

      if (isPlaying && globalAudioState.audioElement) {
        setCurrentTime(globalAudioState.audioElement.currentTime || 0);
        setDuration(globalAudioState.audioElement.duration || 0);
      }
    };

    const intervalId = setInterval(checkAudioStatus, 500);
    return () => clearInterval(intervalId);
  }, []);

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

  const formatTime = useCallback((time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const getCodeTitle = useCallback((codeId: string): string => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : "Código";
  }, []);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 bg-netflix-bg/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-2 py-2">
          {/* Mini audio player */}
          <AnimatePresence>
            {isAudioPlaying && currentAudioInfo && (
              <motion.div 
                initial={{ y: -40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -40, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-2 bg-gradient-to-r from-law-accent/80 to-law-accent/60 backdrop-blur-sm p-2 z-20 rounded-md shadow-lg"
              >
                <div className="flex items-center justify-between max-w-full mx-auto">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors" 
                      onClick={togglePlay}
                    >
                      <Volume className="h-4 w-4" />
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
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors" 
                      onClick={navigateToArticle}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main navigation with fixed navigation logic */}
          <nav className="relative flex justify-around items-center h-16">
            {/* Smooth sliding background indicator */}
            <div 
              className="absolute top-2 h-12 bg-gradient-to-r from-law-accent/20 to-law-accent/10 rounded-lg transition-all duration-300 ease-out"
              style={{
                left: activeTabIndex >= 0 ? `${(activeTabIndex * 100) / menuItems.length}%` : '-100%',
                width: activeTabIndex >= 0 ? `${100 / menuItems.length}%` : '0%',
                opacity: activeTabIndex >= 0 ? 1 : 0,
              }}
            />

            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTabIndex === index;
                
              return (
                <Tooltip key={`${item.path}-${index}`}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleNavigation(item, index)}
                      className="relative flex flex-col items-center justify-center px-4 py-2 z-10 group cursor-pointer"
                    >
                      <div className="flex flex-col items-center transition-transform duration-200 hover:scale-105">
                        {/* Icon with smooth animation */}
                        <div 
                          className="transition-all duration-300"
                          style={{
                            transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          <Icon 
                            className={cn(
                              "h-5 w-5 transition-all duration-300",
                              isActive 
                                ? "text-law-accent filter drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]" 
                                : "text-gray-400 group-hover:text-gray-300"
                            )} 
                          />
                        </div>
                        
                        {/* Label with smooth color transition */}
                        <span 
                          className={cn(
                            "text-xs mt-1 font-medium transition-all duration-300",
                            isActive 
                              ? "text-law-accent font-semibold" 
                              : "text-gray-400 group-hover:text-gray-300"
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                      
                      {/* Bottom highlight bar */}
                      <div 
                        className="absolute -bottom-2 left-1/2 h-1 bg-gradient-to-r from-law-accent to-netflix-red rounded-full transition-all duration-300"
                        style={{
                          width: isActive ? '48px' : '0px',
                          opacity: isActive ? 1 : 0,
                          transform: 'translateX(-50%)',
                        }}
                      />
                      
                      {/* Audio playing indicator */}
                      {item.path === "/audio-comentarios" && isAudioPlaying && (
                        <span 
                          className="absolute top-3 right-[calc(50%-12px)] h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"
                        />
                      )}
                    </button>
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
