
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Scale, Search, BookOpen, Headphones, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";

export const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      label: "Pesquisar",
      path: "/pesquisar",
      icon: Search
    },
    {
      label: "Códigos",
      path: "/codigos", 
      icon: BookOpen
    },
    {
      label: "Comentários",
      path: "/audio-comentarios",
      icon: Headphones
    },
    {
      label: "Leis",
      path: "/codigos?filter=lei",
      icon: FileText
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <Scale className="h-6 w-6 text-law-accent" />
            <span className="hidden font-serif font-bold sm:inline-block text-law-accent">
              JurisGuide
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path === '/codigos' && currentPath.startsWith('/codigos/'));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "transition-colors hover:text-foreground/80 flex items-center gap-2",
                    isActive ? "text-law-accent" : "text-foreground/60"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link className="mr-6 flex items-center space-x-2 md:hidden" to="/">
              <Scale className="h-6 w-6 text-law-accent" />
              <span className="font-serif font-bold text-law-accent">
                JurisGuide
              </span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-2">
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
};
