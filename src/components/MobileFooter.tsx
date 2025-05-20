
import { Home, BookOpen, Search, Bookmark, Headphones } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState, useCallback } from "react";

export const MobileFooter = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Simplified check for audio playing state
  useEffect(() => {
    const checkAudioStatus = () => {
      setIsAudioPlaying(!!globalAudioState.currentAudioId);
    };
    
    // Initial check
    checkAudioStatus();
    
    // Set up a less frequent interval as a fallback
    const intervalId = setInterval(checkAudioStatus, 2000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
      <footer className="bg-netflix-bg border-t border-gray-800 shadow-lg md:hidden">
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
