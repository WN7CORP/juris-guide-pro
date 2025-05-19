
import { Home, BookOpen, Search, Bookmark, Volume } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const FloatingMenu = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: BookOpen, label: "Códigos", path: "/codigos" },
    { icon: Volume, label: "Comentados", path: "/comentados" },
    { icon: Search, label: "Pesquisar", path: "/pesquisar" },
    { icon: Bookmark, label: "Favoritos", path: "/favoritos" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 md:hidden">
      <nav className="flex items-center justify-center py-2 px-3 gap-1 bg-netflix-bg/80 backdrop-blur-md border border-gray-800 rounded-full shadow-lg">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center p-2 rounded-full transition-all duration-300",
              currentPath === item.path
                ? "text-netflix-red bg-gray-800/50"
                : "text-gray-400 hover:bg-gray-800/30"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default FloatingMenu;
