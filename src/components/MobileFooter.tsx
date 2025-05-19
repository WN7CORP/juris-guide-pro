
import { Home, Scale, Gavel, Volume, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MobileFooter = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Scale, label: "Códigos", path: "/codigos" },
    { icon: Gavel, label: "Estatutos", path: "/estatutos" },
    { icon: Volume, label: "Comentados", path: "/comentados" },
    { icon: Bookmark, label: "Favoritos", path: "/favoritos" },
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-netflix-bg to-netflix-bg/95 border-t border-gray-800 shadow-lg md:hidden z-10">
      <nav className="flex justify-around items-center py-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center p-2 rounded-md transition-colors",
              currentPath === item.path || currentPath.startsWith(item.path + '/')
                ? "text-netflix-red font-medium"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default MobileFooter;
