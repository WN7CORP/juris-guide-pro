import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState } from "react";
export const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  useEffect(() => {
    // Check if audio is playing and update the state
    const checkAudioStatus = () => {
      setIsAudioPlaying(!!globalAudioState.currentAudioId);
    };

    // Set up interval to check audio status
    const intervalId = setInterval(checkAudioStatus, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  const menuItems = [{
    label: "Início",
    path: "/"
  }, {
    label: "Códigos",
    path: "/codigos"
  }, {
    label: "Pesquisar",
    path: "/pesquisar"
  }, {
    label: "Áudio",
    path: "/audio-comentarios"
  }, {
    label: "Favoritos",
    path: "/favoritos"
  }];
  return <header className="sticky top-0 z-20 bg-netflix-bg border-b border-gray-800">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-serif font-bold text-netflix-red px-[67px]">
            Vade Mecum
          </h1>
        </Link>
        
        {/* Navigation links - visible on all screen sizes */}
        <nav className="flex items-center space-x-1 sm:space-x-4">
          {menuItems.map(item => {})}
        </nav>
      </div>
    </header>;
};
export default Header;