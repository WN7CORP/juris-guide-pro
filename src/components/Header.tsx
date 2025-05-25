
import { Scale } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Códigos", href: "/codigos" },
    { name: "Pesquisar", href: "/pesquisar" },
    { name: "Anotações", href: "/anotacoes" },
    { name: "Áudios", href: "/audio-comentarios" }
  ];

  return (
    <header className="bg-netflix-bg border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-law-accent" />
            <span className="text-xl font-serif font-bold text-law-accent">
              JurisGuide
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === '/codigos' && location.pathname.startsWith('/codigos/'));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-law-accent",
                      isActive
                        ? "text-law-accent"
                        : "text-gray-300"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
