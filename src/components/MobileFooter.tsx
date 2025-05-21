import { Home, BookOpen, Search, Bookmark, Headphones, Play, Pause, Volume, VolumeX } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { legalCodes } from "@/data/legalCodes";
import { motion } from "framer-motion";
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
    const {
      codeId,
      articleId
    } = currentAudioInfo;
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
  return <TooltipProvider>
      {/* Mini audio player that appears when audio is playing */}
      {isAudioPlaying && currentAudioInfo && <motion.div initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} exit={{
      y: 20,
      opacity: 0
    }} className="fixed bottom-16 left-0 right-0 mx-auto w-[95%] max-w-md bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-md p-2 shadow-lg z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20" onClick={togglePlay}>
                {globalAudioState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-gray-300" />}
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20" onClick={navigateToArticle}>
                <BookOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>}

      {/* Main footer navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-netflix-bg border-t border-gray-800 shadow-lg md:hidden z-10">
        
      </footer>
    </TooltipProvider>;
};
export default MobileFooter;