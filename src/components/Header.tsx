
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Search, Bookmark, Headphones, Volume } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { 
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Separator } from "@/components/ui/separator";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioInfo, setCurrentAudioInfo] = useState<any>(null);

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
    };

    // Set up interval to check audio status
    const intervalId = setInterval(checkAudioStatus, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const navigateToAudioComments = () => {
    if (currentAudioInfo) {
      const { codeId, articleId } = currentAudioInfo;
      navigate(`/codigos/${codeId}?article=${articleId}`);
    } else {
      navigate('/audio-comentarios');
    }
  };

  const menuItems = [{
    label: "Início",
    path: "/",
    icon: Home
  }, {
    label: "Códigos",
    path: "/codigos",
    icon: BookOpen
  }, {
    label: "Pesquisar",
    path: "/pesquisar",
    icon: Search
  }, {
    label: "Áudio",
    path: "/audio-comentarios",
    icon: Headphones
  }, {
    label: "Favoritos",
    path: "/favoritos",
    icon: Bookmark
  }];

  return (
    <header className="sticky top-0 z-20 bg-netflix-bg border-b border-gray-800">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-serif font-bold text-netflix-red">
            Vade Mecum
          </h1>
        </Link>
        
        {/* Desktop Navigation Menu */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map(item => (
                <NavigationMenuItem key={item.path}>
                  <Link to={item.path}>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        currentPath === item.path
                          ? "text-netflix-red"
                          : "text-gray-300 hover:text-netflix-red",
                        item.path === "/audio-comentarios" && isAudioPlaying && currentPath !== "/audio-comentarios"
                          ? "animate-pulse"
                          : ""
                      )}
                    >
                      {item.label}
                      {item.path === "/audio-comentarios" && isAudioPlaying && (
                        <Volume className="inline-block ml-1 h-3 w-3 text-netflix-red" />
                      )}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Mobile Menu at Top (Replacing Footer) */}
        <div className="fixed top-0 left-0 w-full z-30 bg-netflix-bg border-b border-gray-800 md:hidden">
          <div className="flex justify-between items-center px-4 py-2">
            <Link to="/" className="text-xl font-serif font-bold text-netflix-red">VM</Link>
            
            <div className="flex items-center gap-1">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    currentPath === item.path
                      ? "text-netflix-red"
                      : "text-gray-400",
                    item.path === "/audio-comentarios" && isAudioPlaying && currentPath !== "/audio-comentarios"
                      ? "animate-pulse"
                      : ""
                  )}
                  onClick={(e) => {
                    if (item.path === "/audio-comentarios" && isAudioPlaying) {
                      e.preventDefault();
                      navigateToAudioComments();
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Current playing audio indicator - visible on all screen sizes when audio is playing */}
      {isAudioPlaying && currentAudioInfo && (
        <div 
          className="bg-netflix-dark/60 backdrop-blur-sm border-t border-gray-800 py-1 px-4 text-center text-xs text-netflix-red cursor-pointer"
          onClick={navigateToAudioComments}
        >
          <div className="flex items-center justify-center gap-1">
            <Volume className="h-3 w-3" />
            <span>
              {currentAudioInfo.articleNumber ? `Reproduzindo: Art. ${currentAudioInfo.articleNumber}` : 'Áudio em reprodução'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
