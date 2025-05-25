
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
      icon: BookOpen,
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
        <div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
          {/* Navigation Menu */}
          <nav className="flex items-center space-x-1 sm:space-x-6">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
              
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex flex-col items-center gap-0.5 sm:gap-1 px-1 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 relative group min-w-0",
                        isActive 
                          ? "text-law-accent bg-law-accent/10 border border-law-accent/20" 
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      )}
                    >
                      <div className="relative">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {item.badge && (
                          <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-netflix-red text-white text-xs font-bold rounded-full h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center text-[10px] sm:text-xs">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {/* Show label only on larger screens */}
                      <span className="hidden sm:block text-xs font-medium">{item.label}</span>
                      {/* Show shorter label on mobile */}
                      <span className="block sm:hidden text-[10px] font-medium leading-tight">
                        {item.label === "Comentários" ? "Audio" : 
                         item.label === "Códigos" ? "Codes" :
                         item.label === "Favoritos" ? "Fav" :
                         item.label === "Início" ? "Home" : item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center gap-1 sm:gap-2">
            <UserMenu />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
