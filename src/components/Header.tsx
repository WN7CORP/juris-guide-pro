
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume, BookOpen, Search, Bookmark, Home, Headphones } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

export const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Check if audio is playing and update the state
    const checkAudioStatus = () => {
      setIsAudioPlaying(!!globalAudioState.currentAudioId);
    };

    // Set up interval to check audio status
    const intervalId = setInterval(checkAudioStatus, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const menuItems = [
    {
      label: "Início",
      path: "/",
      icon: Home,
      description: "Página inicial do Vade Mecum"
    }, 
    {
      label: "Códigos",
      path: "/codigos",
      icon: BookOpen,
      description: "Acesse todos os códigos disponíveis"
    }, 
    {
      label: "Pesquisar",
      path: "/pesquisar",
      icon: Search,
      description: "Pesquise em todos os códigos"
    }, 
    {
      label: "Áudio",
      path: "/audio-comentarios",
      icon: Headphones,
      description: "Acesse todos os comentários em áudio",
      highlight: isAudioPlaying
    }, 
    {
      label: "Favoritos",
      path: "/favoritos",
      icon: Bookmark,
      description: "Seus artigos favoritos"
    }
  ];

  return (
    <header className="sticky top-0 z-20 bg-netflix-bg border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-serif font-bold text-netflix-red">
            Vade Mecum
          </h1>
        </Link>
        
        {/* Desktop Navigation with Dropdown Menus */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map(item => (
                <NavigationMenuItem key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md",
                      currentPath === item.path
                        ? "text-netflix-red"
                        : "text-gray-300 hover:text-netflix-red",
                      item.highlight && currentPath !== item.path
                        ? "animate-pulse"
                        : ""
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.highlight && currentPath !== item.path && (
                      <span className="ml-1 h-2 w-2 rounded-full bg-netflix-red"></span>
                    )}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center space-x-1 sm:space-x-4">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-2 py-1 text-sm font-medium transition-colors rounded-md flex flex-col items-center",
                currentPath === item.path
                  ? "text-netflix-red"
                  : "text-gray-300 hover:text-netflix-red",
                item.highlight && currentPath !== item.path
                  ? "animate-pulse"
                  : ""
              )}
            >
              <item.icon className="h-4 w-4 mb-1" />
              <span className="text-xs">{item.label}</span>
              {item.highlight && currentPath !== item.path && (
                <Volume className="h-3 w-3 text-netflix-red" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
