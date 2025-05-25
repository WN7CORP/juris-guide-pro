
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Volume, BookOpen, Scale, Gavel, FileText, Home, Headphones, Bookmark, LogOut, User, StickyNote } from "lucide-react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { legalCodes } from "@/data/legalCodes";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/components/user/UserProfile";
import { toast } from "sonner";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const { user, profile, signOut } = useAuth();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioInfo, setCurrentAudioInfo] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  // Desktop menu items
  const desktopMenuItems = useMemo(() => [
    { icon: Home, label: "Início", path: "/" },
    { icon: Scale, label: "Códigos", path: "/codigos" },
    { icon: Gavel, label: "Estatutos", path: "/codigos?filter=estatuto" },
    { icon: Headphones, label: "Análises", path: "/audio-comentarios" },
    { icon: FileText, label: "Leis", path: "/codigos?filter=lei" },
    { icon: StickyNote, label: "Anotações", path: "/anotacoes" },
    { icon: Bookmark, label: "Favoritos", path: "/favoritos" }
  ], []);

  // Enhanced active tab logic that considers both path and filter
  const getActiveTabIndex = useCallback(() => {
    if (isMobile) return -1; // Mobile uses footer navigation
    
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');

    if (currentPath === "/") return 0;
    if (currentPath === "/audio-comentarios") return 3;
    if (currentPath === "/anotacoes") return 5;
    if (currentPath === "/favoritos") return 6;
    
    if (currentPath === "/codigos" || currentPath.startsWith("/codigos/")) {
      // More precise filter matching
      if (filter === "estatuto") return 2;
      if (filter === "lei") return 4;
      // Default to Códigos when no filter or when filter is "código"
      return 1;
    }

    return -1;
  }, [currentPath, location.search, isMobile]);

  const activeTabIndex = getActiveTabIndex();

  // Enhanced navigation function that preserves URL structure
  const handleNavigation = useCallback((item: typeof desktopMenuItems[0], index: number) => {
    if (index === 0) {
      navigate("/", { replace: true });
    } else if (index === 1) {
      navigate("/codigos", { replace: true });
    } else if (index === 2) {
      navigate("/codigos?filter=estatuto", { replace: true });
    } else if (index === 3) {
      navigate("/audio-comentarios", { replace: true });
    } else if (index === 4) {
      navigate("/codigos?filter=lei", { replace: true });
    } else if (index === 5) {
      navigate("/anotacoes", { replace: true });
    } else if (index === 6) {
      navigate("/favoritos", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const checkAudioStatus = () => {
      const isPlaying = !!globalAudioState.currentAudioId;
      setIsAudioPlaying(isPlaying);
      if (isPlaying && globalAudioState.minimalPlayerInfo) {
        setCurrentAudioInfo(globalAudioState.minimalPlayerInfo);
      } else {
        setCurrentAudioInfo(null);
      }

      if (isPlaying && globalAudioState.audioElement) {
        setCurrentTime(globalAudioState.audioElement.currentTime || 0);
        setDuration(globalAudioState.audioElement.duration || 0);
      }
    };

    const intervalId = setInterval(checkAudioStatus, 500);
    return () => clearInterval(intervalId);
  }, []);

  const togglePlay = useCallback(() => {
    if (!globalAudioState.audioElement) return;
    if (globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.play();
      globalAudioState.isPlaying = true;
    } else {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
    }
  }, []);

  const navigateToArticle = useCallback(() => {
    if (!currentAudioInfo) return;
    const { codeId, articleId } = currentAudioInfo;
    navigate(`/codigos/${codeId}?article=${articleId}`);
  }, [currentAudioInfo, navigate]);

  const formatTime = useCallback((time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const getCodeTitle = useCallback((codeId: string): string => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : "Código";
  }, []);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erro ao fazer logout');
    } else {
      toast.success('Logout realizado com sucesso');
    }
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 bg-netflix-bg/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-2 py-2">
          {/* Mini audio player */}
          <AnimatePresence>
            {isAudioPlaying && currentAudioInfo && (
              <motion.div 
                initial={{ y: -40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -40, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-2 bg-gradient-to-r from-law-accent/80 to-law-accent/60 backdrop-blur-sm p-2 z-20 rounded-md shadow-lg"
              >
                <div className="flex items-center justify-between max-w-full mx-auto">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors" 
                      onClick={togglePlay}
                    >
                      <Volume className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-white truncate max-w-[150px]">
                      <div className="font-medium truncate">
                        {currentAudioInfo.articleNumber ? `Art. ${currentAudioInfo.articleNumber}` : 'Análise'}
                      </div>
                      <div className="opacity-80 text-[10px] truncate">
                        {getCodeTitle(currentAudioInfo.codeId)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-white">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors" 
                      onClick={navigateToArticle}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation with user menu - Always visible */}
          <div className="flex items-center justify-between">
            {/* Logo/Brand - sempre visível no mobile */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-law-accent" />
                <span className="font-serif font-bold text-law-accent text-lg">
                  {isMobile ? "VM" : "Vade Mecum"}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="relative flex justify-around items-center h-14 md:h-16 overflow-hidden flex-1 mx-8">
                {/* Fixed background indicator */}
                {activeTabIndex >= 0 && (
                  <div 
                    className="absolute top-1 md:top-2 h-10 md:h-12 bg-gradient-to-r from-law-accent/20 to-law-accent/10 rounded-md transition-all duration-300 ease-out"
                    style={{
                      left: `${(activeTabIndex * 100) / desktopMenuItems.length}%`,
                      width: `${100 / desktopMenuItems.length}%`,
                    }}
                  />
                )}

                {desktopMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTabIndex === index;
                  
                  return (
                    <Tooltip key={`nav-${index}`}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleNavigation(item, index)}
                          className="relative flex flex-col items-center justify-center px-2 md:px-4 py-1 md:py-2 z-10 group cursor-pointer min-w-0 flex-1"
                        >
                          <div className="flex flex-col items-center transition-transform duration-150 hover:scale-105">
                            <Icon 
                              className={cn(
                                "h-4 w-4 md:h-5 md:w-5 transition-all duration-200",
                                isActive 
                                  ? "text-law-accent" 
                                  : "text-gray-400 group-hover:text-gray-300"
                              )} 
                            />
                            
                            <span 
                              className={cn(
                                "text-[10px] md:text-xs mt-0.5 md:mt-1 font-medium transition-colors duration-200 truncate max-w-full",
                                isActive 
                                  ? "text-law-accent font-semibold" 
                                  : "text-gray-400 group-hover:text-gray-300"
                              )}
                            >
                              {item.label}
                            </span>
                          </div>
                          
                          {isActive && (
                            <div className="absolute -bottom-1 left-1/2 h-0.5 w-8 md:w-12 bg-law-accent rounded-full transform -translate-x-1/2" />
                          )}
                          
                          {item.path === "/audio-comentarios" && isAudioPlaying && (
                            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="mb-1">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </nav>
            )}

            {/* User Menu - Always visible */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                      <AvatarFallback className="bg-law-accent/20 text-law-accent">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                      <AvatarFallback className="bg-law-accent/20 text-law-accent">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-white">
                        {profile?.username || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => setShowProfile(true)}
                    className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 focus:bg-red-600 focus:text-white cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
    </TooltipProvider>
  );
};

export default Header;
