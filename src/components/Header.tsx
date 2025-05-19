
import { Menu, Scale, Gavel, Search, Home, Bookmark, Volume } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { legalCodes } from "@/data/legalCodes";

export const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define main navigation items
  const mainNavItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Scale, label: "Códigos", path: "/codigos" },
    { icon: Gavel, label: "Estatutos", path: "/estatutos" },
    { icon: Volume, label: "Comentados", path: "/comentados" },
    { icon: Bookmark, label: "Favoritos", path: "/favoritos" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-netflix-bg border-b border-gray-800">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-netflix-red to-red-700 flex items-center justify-center text-white font-bold animate-float">
              JL
            </div>
            <span className="text-lg font-serif font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Vade Mecum
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center ml-8 space-x-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm transition-colors rounded-md hover:text-white group",
                  currentPath === item.path || currentPath.startsWith(item.path + '/')
                    ? "text-netflix-red bg-gray-900/60"
                    : "text-gray-300 hover:bg-gray-900/40"
                )}
              >
                <item.icon className="w-4 h-4 mr-2 group-hover:text-netflix-red transition-colors" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/pesquisar">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-netflix-red">
              <Search className="h-5 w-5" />
              <span className="sr-only">Pesquisar</span>
            </Button>
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-300 hover:text-netflix-red">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-netflix-bg border-gray-800 p-0">
              <SheetHeader className="border-b border-gray-800 p-4">
                <SheetTitle className="text-white font-serif flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-netflix-red to-red-700 flex items-center justify-center text-white font-bold">
                    JL
                  </div>
                  <span>Vade Mecum Digital</span>
                </SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <nav className="space-y-1 px-2">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                        currentPath === item.path || currentPath.startsWith(item.path + '/')
                          ? "bg-gray-800 text-netflix-red"
                          : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                
                <div className="mt-6 px-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                    Códigos populares
                  </h4>
                  <div className="space-y-1">
                    {legalCodes.slice(0, 5).map((code) => (
                      <Link
                        key={code.id}
                        to={`/codigos/${code.id}`}
                        className="block px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {code.shortTitle}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
