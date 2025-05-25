
import { Link, useLocation } from "react-router-dom";
import { Scale, Home, BookOpen, Bookmark, User, StickyNote, Headphones } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritesStore } from "@/store/favoritesStore";

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
      icon: Bookmark,
      label: "Favoritos",
      path: "/favoritos",
      showAlways: true,
      badge: favorites.length > 0 ? favorites.length : null
    },
    {
      icon: Headphones,
      label: "Comentários",
      path: "/audio-comentarios",
      showAlways: true
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-netflix-bg/95 backdrop-blur supports-[backdrop-filter]:bg-netflix-bg/80">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo Icon Only */}
        <Link className="flex items-center" to="/">
          <Scale className="h-7 w-7 text-law-accent" />
        </Link>
        
        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => {
            // Show item if showAlways is true, or if user is logged in
            if (!item.showAlways && !user) return null;
            
            const isActive = currentPath === item.path || 
              (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 relative",
                  isActive 
                    ? "text-law-accent bg-law-accent/10 border border-law-accent/20" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                )}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
                {item.badge && (
                  <span className="bg-netflix-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center space-x-1">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = currentPath === item.path || 
              (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 relative",
                  isActive 
                    ? "text-law-accent" 
                    : "text-gray-400 hover:text-gray-300"
                )}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-netflix-red text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User Menu */}
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
