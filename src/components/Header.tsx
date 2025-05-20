
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Search, Bookmark, Headphones, Volume, Menu } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioInfo, setCurrentAudioInfo] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    icon: Home,
    description: "Voltar para a página inicial"
  }, {
    label: "Códigos",
    path: "/codigos",
    icon: BookOpen,
    description: "Acessar todos os códigos disponíveis"
  }, {
    label: "Pesquisar",
    path: "/pesquisar",
    icon: Search,
    description: "Pesquisar artigos e códigos"
  }, {
    label: "Áudio",
    path: "/audio-comentarios",
    icon: Headphones,
    description: "Ver todos os comentários em áudio"
  }, {
    label: "Favoritos",
    path: "/favoritos",
    icon: Bookmark,
    description: "Acessar seus artigos favoritos"
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
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.path === "/audio-comentarios" && isAudioPlaying && (
                          <Volume className="h-3 w-3 text-netflix-red" />
                        )}
                      </div>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-gray-300 hover:text-netflix-red">
                <Menu className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-netflix-bg border border-gray-800">
              {menuItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link 
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 hover:bg-netflix-dark",
                      currentPath === item.path ? "text-netflix-red" : "text-gray-300"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-gray-400">{item.description}</span>
                    </div>
                    {item.path === "/audio-comentarios" && isAudioPlaying && (
                      <Volume className="h-3 w-3 text-netflix-red ml-auto" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-30 bg-netflix-bg border-b border-gray-800 md:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <Link to="/" className="text-xl font-serif font-bold text-netflix-red">VM</Link>
          
          <div className="flex items-center space-x-5">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center text-xs font-medium transition-colors",
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
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            ))}
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
