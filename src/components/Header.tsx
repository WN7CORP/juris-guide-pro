
import { Link, useLocation } from "react-router-dom";
import { Scale, Home, BookOpen, Bookmark, User, Headphones } from "lucide-react";
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
      icon: Headphones,
      label: "Comentários",
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-4">
            <Scale className="h-6 w-6 text-law-accent" />
            <span className="text-lg font-serif font-bold text-law-accent hidden sm:block">
              VadeMecum Pro 2025
            </span>
            <span className="text-sm font-serif font-bold text-law-accent sm:hidden">
              VMP 2025
            </span>
          </Link>

          {/* Navigation Menu */}
          <nav className="flex items-center flex-1 sm:flex-none">
            <div className="flex w-full sm:w-auto justify-between sm:justify-start sm:space-x-2 lg:space-x-4">
              {menuItems.map((item) => {
                const isActive = currentPath === item.path || 
                  (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
                
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex flex-col items-center gap-0.5 px-1 sm:px-2 lg:px-3 py-2 rounded-lg transition-all duration-200 relative group flex-1 sm:flex-none min-w-0",
                          isActive 
                            ? "text-law-accent bg-law-accent/10 border border-law-accent/20" 
                            : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 bg-netflix-red text-white text-xs font-bold rounded-full h-3 w-3 flex items-center justify-center text-[8px] sm:h-3.5 sm:w-3.5 sm:text-[9px]">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium leading-tight text-center truncate w-full">
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
