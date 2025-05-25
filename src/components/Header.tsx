
import { Home, BookOpen, Search, StickyNote, Headphones } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigation = [
    { name: "Início", href: "/", icon: Home },
    { name: "Códigos", href: "/codigos", icon: BookOpen },
    { name: "Pesquisar", href: "/pesquisar", icon: Search },
    { name: "Anotações", href: "/anotacoes", icon: StickyNote },
    { name: "Áudios", href: "/audio-comentarios", icon: Headphones }
  ];

  return (
    <header className="bg-netflix-bg border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16">
          {/* Navigation with icons */}
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/codigos' && location.pathname.startsWith('/codigos/'));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-law-accent px-3 py-2 rounded-md",
                    isActive
                      ? "text-law-accent bg-law-accent/10"
                      : "text-gray-300"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
