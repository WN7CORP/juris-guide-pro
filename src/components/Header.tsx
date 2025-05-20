
import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { legalCodes } from "@/data/legalCodes";
import ThemeToggle from "./ThemeToggle";
import ViewHistoryPanel from "./ViewHistoryPanel";

export const Header = () => {
  const firstFiveCodes = legalCodes.slice(0, 5);
  const remainingCodes = legalCodes.slice(5);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-800 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="text-law-accent font-bold text-2xl mr-8 flex-shrink-0 md:flex">
          LegalFlex
        </Link>
        
        <div className="flex-1 md:flex items-center hidden">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  to="/"
                  className={navigationMenuTriggerStyle()}
                >
                  Início
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Códigos</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-2">
                    {firstFiveCodes.map((code) => (
                      <ListItem
                        key={code.id}
                        title={code.title}
                        href={`/codigos/${code.id}`}
                      >
                        {code.description}
                      </ListItem>
                    ))}
                  </ul>
                  
                  <div className="p-4 pt-0">
                    <Link
                      to="/codigos"
                      className="flex justify-center w-full items-center rounded-md border border-gray-700 bg-gray-900 py-3 px-4 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                      Ver todos os códigos 
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link
                  to="/pesquisar"
                  className={navigationMenuTriggerStyle()}
                >
                  Pesquisar
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link
                  to="/audio-comentarios"
                  className={navigationMenuTriggerStyle()}
                >
                  Comentários
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link
                  to="/favoritos"
                  className={navigationMenuTriggerStyle()}
                >
                  Favoritos
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <ViewHistoryPanel />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Header;
