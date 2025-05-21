import { Home, BookOpen, Search, Bookmark, Headphones, Play, Pause, Volume, VolumeX } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { legalCodes } from "@/data/legalCodes";
import { motion } from "framer-motion";
import { formatTime } from "@/utils/formatters";
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

    // If we're on the audio comments page, navigate with focus intent
    if (currentPath === '/audio-comentarios') {
      // Leave navigation on same page, the component itself will handle focus mode
      return;
    }

    // Otherwise navigate to article page
    const {
      codeId,
      articleId
    } = currentAudioInfo;
    navigate(`/codigos/${codeId}?article=${articleId}`);
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
      {isAudioPlaying && currentAudioInfo}

      {/* Main footer navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-netflix-bg border-t border-gray-800 shadow-lg md:hidden z-10">
        <div className="flex justify-around items-center h-16">
          {menuItems.map(item => {
          const isActive = item.isActive ? item.isActive(currentPath) : currentPath === item.path || item.path === '/codigos' && currentPath.startsWith('/codigos/');
          return <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link to={item.path} className={cn("flex flex-col items-center justify-center p-2 w-full", isActive ? "text-law-accent" : "text-gray-400 hover:text-gray-300")}>
                    <item.icon className={cn("h-5 w-5", isActive && "text-law-accent")} />
                    <span className="text-xs mt-1">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                  {item.label}
                </TooltipContent>
              </Tooltip>;
        })}
        </div>
      </footer>
    </TooltipProvider>;
};
export default MobileFooter;