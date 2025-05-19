
import { Menu, Scale, Gavel } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { legalCodes } from "@/data/legalCodes";

export const Header = () => {
  return (
    <header className="sticky top-0 z-20 bg-netflix-bg border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-serif font-bold text-netflix-red">Vade Mecum Digital</h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-netflix-dark border-gray-800">
              <SheetHeader>
                <SheetTitle className="font-serif text-netflix-red">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="p-2 rounded-full bg-netflix-red/10">
                    <Scale className="h-5 w-5 text-netflix-red" />
                  </div>
                  <span>Início</span>
                </Link>
                
                <Link 
                  to="/codigos" 
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="p-2 rounded-full bg-netflix-red/10">
                    <Scale className="h-5 w-5 text-netflix-red" />
                  </div>
                  <span>Códigos</span>
                </Link>
                
                <Link 
                  to="/estatutos" 
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="p-2 rounded-full bg-netflix-red/10">
                    <Gavel className="h-5 w-5 text-netflix-red" />
                  </div>
                  <span>Estatutos</span>
                </Link>
                
                <Link 
                  to="/comentados" 
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="p-2 rounded-full bg-netflix-red/10">
                    <Scale className="h-5 w-5 text-netflix-red" />
                  </div>
                  <span>Comentados</span>
                </Link>
                
                <Link 
                  to="/favoritos" 
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="p-2 rounded-full bg-netflix-red/10">
                    <Scale className="h-5 w-5 text-netflix-red" />
                  </div>
                  <span>Favoritos</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
export default Header;
