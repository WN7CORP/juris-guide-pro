
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Search, Bookmark, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { legalCodes } from '@/data/legalCodes';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';

export const TopNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed w-full top-0 z-40 transition-all duration-300",
        isScrolled ? "bg-netflix-bg/95 shadow-md backdrop-blur-sm" : "bg-gradient-to-b from-netflix-bg to-transparent"
      )}
    >
      <div className="container flex items-center justify-between py-3">
        {/* Logo section */}
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-serif font-bold text-netflix-red animate-fade-in">
            Vade Mecum
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    to="/" 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-medium",
                      currentPath === "/" ? "bg-accent/50 text-law-accent" : ""
                    )}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Início
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-medium">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Códigos
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {legalCodes.map((code) => (
                      <li key={code.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={`/codigos/${code.id}`}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              currentPath === `/codigos/${code.id}` ? "bg-accent/50 text-law-accent" : ""
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{code.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {code.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    to="/pesquisar" 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-medium",
                      currentPath === "/pesquisar" ? "bg-accent/50 text-law-accent" : ""
                    )}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Pesquisar
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    to="/favoritos" 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-medium",
                      currentPath === "/favoritos" ? "bg-accent/50 text-law-accent" : ""
                    )}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Favoritos
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-netflix-bg flex flex-col animate-in slide-in-from-top duration-300" style={{ top: '48px' }}>
            <div className="flex flex-col p-4 space-y-4">
              <Link
                to="/"
                className={cn(
                  "flex items-center px-4 py-3 rounded-md transition-colors",
                  currentPath === "/"
                    ? "bg-netflix-dark text-law-accent"
                    : "hover:bg-netflix-dark/80"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                <span className="font-medium">Início</span>
              </Link>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="px-4 text-sm font-medium text-gray-400 mb-2">Códigos e Estatutos</h3>
                <div className="space-y-1">
                  {legalCodes.map((code) => (
                    <Link
                      key={code.id}
                      to={`/codigos/${code.id}`}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                        currentPath === `/codigos/${code.id}`
                          ? "bg-netflix-dark text-law-accent"
                          : "hover:bg-netflix-dark/80"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {code.title}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/pesquisar"
                className={cn(
                  "flex items-center px-4 py-3 rounded-md transition-colors",
                  currentPath === "/pesquisar"
                    ? "bg-netflix-dark text-law-accent"
                    : "hover:bg-netflix-dark/80"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="mr-3 h-5 w-5" />
                <span className="font-medium">Pesquisar</span>
              </Link>

              <Link
                to="/favoritos"
                className={cn(
                  "flex items-center px-4 py-3 rounded-md transition-colors",
                  currentPath === "/favoritos"
                    ? "bg-netflix-dark text-law-accent"
                    : "hover:bg-netflix-dark/80"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Bookmark className="mr-3 h-5 w-5" />
                <span className="font-medium">Favoritos</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavigation;
