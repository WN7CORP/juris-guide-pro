
import { Home, BookOpen, Search, FileText, Headphones } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Scale } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();

  // If not on mobile, don't render the header
  if (!isMobile) {
    return null;
  }

  const menuItems = [
    {
      icon: Home,
      label: "Início",
      path: "/"
    },
    {
      icon: BookOpen,
      label: "Códigos",
      path: "/codigos"
    },
    {
      icon: Search,
      label: "Pesquisar",
      path: "/pesquisar"
    },
    {
      icon: Headphones,
      label: "Comentários",
      path: "/audio-comentarios"
    },
    {
      icon: FileText,
      label: "Leis",
      path: "/codigos?filter=lei"
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      {/* Top bar with logo and user menu */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link className="flex items-center space-x-2" to="/">
          <Scale className="h-6 w-6 text-law-accent" />
          <span className="font-serif font-bold text-law-accent">
            JurisGuide
          </span>
        </Link>
        <UserMenu />
      </div>
      
      {/* Navigation menu */}
      <div className="border-t border-gray-800">
        <div className="flex justify-around items-center h-14">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
                
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 w-full transition-colors",
                  isActive ? "text-law-accent" : "text-gray-400 hover:text-gray-300"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-law-accent")} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
