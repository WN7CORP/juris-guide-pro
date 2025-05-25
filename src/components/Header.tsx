
import { Link, useLocation } from "react-router-dom";
import { Scale, Home, BookOpen, Bookmark, User, AudioLines } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const { favorites } = useFavoritesStore();

  const menuItems = [
    {
      icon: Home,
      label: "Início",
      path: "/",
      showAlways: true
    },
    {
      icon: Scale,
      label: "Códigos",
      path: "/codigos",
      showAlways: true
    },
    {
      icon: AudioLines,
      label: "Áudios",
      path: "/audio-comentarios",
      showAlways: true
    },
    {
      icon: Bookmark,
      label: "Favoritos",
      path: "/favoritos",
      showAlways: true,
      badge: favorites.length > 0 ? favorites.length : null
    }
  ];

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-netflix-bg/95 backdrop-blur supports-[backdrop-filter]:bg-netflix-bg/80">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-1 sm:px-4">
          {/* Navigation Menu */}
          <nav className="flex items-center flex-1 sm:flex-none">
            <div className="flex w-full sm:w-auto justify-between sm:justify-start sm:space-x-4">
              {menuItems.map((item) => {
                const isActive = currentPath === item.path || 
                  (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
                
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex flex-col items-center gap-1 px-1.5 sm:px-3 py-2 rounded-lg transition-all duration-200 relative group flex-1 sm:flex-none min-w-0",
                          isActive 
                            ? "text-law-accent bg-law-accent/10 border border-law-accent/20" 
                            : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          {item.badge && (
                            <span className="absolute -top-1.5 -right-1.5 bg-netflix-red text-white text-xs font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center text-[9px]">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium leading-tight text-center truncate w-full">
                          {item.label}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
