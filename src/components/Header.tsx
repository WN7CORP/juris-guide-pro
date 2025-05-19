
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { legalCodes } from "@/data/legalCodes";

export const Header = () => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="container flex justify-between items-center py-4">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-serif font-bold text-law">
            Vade Mecum
          </h1>
        </Link>
        
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="text-gray-700 hover:text-law">
            Início
          </Link>
          <Link to="/codigos" className="text-gray-700 hover:text-law">
            Códigos
          </Link>
          <Link to="/pesquisar" className="text-gray-700 hover:text-law">
            Pesquisar
          </Link>
          <Link to="/favoritos" className="text-gray-700 hover:text-law">
            Favoritos
          </Link>
        </div>
        
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-law font-serif">
                Vade Mecum
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className={cn(
                  "flex items-center p-2 hover:bg-accent rounded-md"
                )}
              >
                Início
              </Link>
              <div>
                <h3 className="font-semibold mb-2">Códigos e Estatutos</h3>
                <div className="flex flex-col space-y-1 pl-2">
                  {legalCodes.map((code) => (
                    <Link
                      key={code.id}
                      to={`/codigos/${code.id}`}
                      className="text-sm py-1 px-2 hover:bg-accent rounded-md"
                    >
                      {code.title}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/pesquisar"
                className="flex items-center p-2 hover:bg-accent rounded-md"
              >
                Pesquisar
              </Link>
              <Link
                to="/favoritos"
                className="flex items-center p-2 hover:bg-accent rounded-md"
              >
                Favoritos
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
