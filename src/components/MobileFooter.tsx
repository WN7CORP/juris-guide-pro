import { Home, BookOpen, Search, FileText, Headphones, StickyNote } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileFooter = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();

  // If not on mobile, don't render the footer
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
      icon: StickyNote,
      label: "Anotações",
      path: "/anotacoes"
    },
    {
      icon: Headphones,
      label: "Áudios",
      path: "/audio-comentarios"
    }
  ];

  return (
    <TooltipProvider>
      <footer className="fixed bottom-0 left-0 w-full bg-netflix-bg border-t border-gray-800 shadow-lg md:hidden z-10">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
                
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 w-full transition-colors",
                      isActive ? "text-law-accent" : "text-gray-400 hover:text-gray-300"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-law-accent")} />
                    <span className="text-xs mt-1">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </footer>
    </TooltipProvider>
  );
};

export default MobileFooter;
