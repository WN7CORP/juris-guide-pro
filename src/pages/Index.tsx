
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Volume, Scale, Gavel, Headphones, Bookmark, Sparkles, FileText, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useFavoritesStore } from "@/store/favoritesStore";

const Index = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { favorites } = useFavoritesStore();
  const [recentCodes, setRecentCodes] = useState<string[]>([]);

  // Load recent codes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentCodes');
    if (stored) {
      try {
        setRecentCodes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent codes:', e);
      }
    }
  }, []);

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

  // Get recent codes
  const recentVisitedCodes = recentCodes.map(codeId => 
    legalCodes.find(code => code.id === codeId)
  ).filter(Boolean).slice(0, 3);

  // Categories with Pesquisar as first card
  const categories = [
    {
      id: "pesquisar",
      title: "Pesquisar",
      icon: Search,
      color: "text-blue-400",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      description: "Busque em todos os códigos e leis",
      path: "/pesquisar"
    },
    {
      id: "codigos",
      title: "Códigos",
      icon: Scale,
      color: "text-law-accent",
      bgColor: "bg-gradient-to-br from-law-accent/20 to-law-accent/5",
      borderColor: "border-law-accent/30",
      description: "Acesse todos os códigos legais brasileiros",
      path: "/codigos?filter=código"
    },
    {
      id: "estatutos",
      title: "Estatutos",
      icon: Gavel,
      color: "text-netflix-red",
      bgColor: "bg-gradient-to-br from-netflix-red/20 to-netflix-red/5",
      borderColor: "border-netflix-red/30",
      description: "Consulte os estatutos mais importantes",
      path: "/codigos?filter=estatuto"
    },
    {
      id: "leis",
      title: "Leis",
      icon: FileText,
      color: "text-emerald-400",
      bgColor: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/30",
      description: "Consulte as principais leis brasileiras",
      path: "/codigos?filter=lei"
    },
    {
      id: "comentarios",
      title: "Comentários",
      icon: Headphones,
      color: "text-blue-400",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      description: "Ouça comentários em áudio dos artigos",
      path: "/audio-comentarios"
    },
    {
      id: "favoritos",
      title: "Favoritos",
      icon: Bookmark,
      color: "text-green-400",
      bgColor: "bg-gradient-to-br from-green-500/20 to-green-500/5",
      borderColor: "border-green-500/30",
      description: "Acesse seus artigos favoritos",
      path: "/favoritos",
      badge: favorites.length > 0 ? favorites.length.toString() : null
    }
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg bg-gradient-to-b from-netflix-bg to-netflix-dark">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6 animate-fade-in py-[19px] px-[17px]">
        <section className="mb-8">
          <motion.div 
            className="mb-8 bg-gradient-to-r from-law-accent/20 via-netflix-red/20 to-law-accent/10 p-6 rounded-lg border border-gray-800/40" 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center justify-between mb-4"
            >
              <h1 className="text-3xl font-serif font-bold text-netflix-red text-shadow-sm">
                Vade Mecum Digital
              </h1>
              <Sparkles className="h-6 w-6 text-law-accent animate-pulse" />
            </motion.div>
            
            <motion.p 
              className="text-gray-300" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Seu guia jurídico completo com todos os códigos, estatutos e leis principais do Brasil.
            </motion.p>
          </motion.div>

          {/* Category Cards */}
          <motion.div 
            variants={container} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 mb-12"
          >
            {categories.map((category, index) => {
              const Icon = category.icon;
              
              return (
                <motion.div 
                  key={category.id} 
                  variants={item}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  className="col-span-1"
                >
                  <Link to={category.path} className="block h-full">
                    <Card className={`bg-netflix-dark border-gray-800 h-full shadow-lg hover:shadow-xl transition-all duration-300 ${category.borderColor} border overflow-hidden`}>
                      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center h-full">
                        <div className={`p-3 rounded-full ${category.bgColor} ${category.borderColor} border my-2 md:my-3 shadow-glow-sm relative`}>
                          <Icon className={`h-6 w-6 md:h-8 md:w-8 ${category.color}`} />
                          {category.badge && (
                            <span className="absolute -top-2 -right-2 bg-netflix-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {category.badge}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-serif font-semibold text-base md:text-xl mt-1 md:mt-2 text-netflix-red">
                          {category.title}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400 mt-1 hidden md:block">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
        
        {/* Recent Codes */}
        {recentVisitedCodes.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-serif font-bold text-law-accent mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Recentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentVisitedCodes.map((code, index) => 
                code && (
                  <motion.div 
                    key={code.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link 
                      to={`/codigos/${code.id}`} 
                      className="block p-3 bg-netflix-dark border border-gray-800 rounded-md hover:bg-netflix-dark/70 transition-colors"
                    >
                      <h3 className="font-medium text-netflix-red mb-1">{code.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{code.description}</p>
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </motion.section>
        )}

        {/* Display codes */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-serif font-bold text-law-accent mb-6 text-shadow-sm flex items-center">
              <Scale className="mr-2 h-6 w-6" />
              Legislações
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {legalCodes.slice(0, 9).map((code, index) => (
                <motion.div 
                  key={code.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <Link 
                    to={`/codigos/${code.id}`} 
                    className="p-4 bg-gradient-to-br from-netflix-dark to-netflix-bg border border-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="flex items-center mb-2">
                      {code.category === 'código' ? (
                        <Scale className="mr-2 h-5 w-5 text-law-accent" />
                      ) : code.category === 'estatuto' ? (
                        <Gavel className="mr-2 h-5 w-5 text-netflix-red" />
                      ) : (
                        <div className="w-5 h-5 mr-2"></div>
                      )}
                      <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 flex-grow">{code.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                        {code.shortTitle}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex justify-center mt-6"
            >
              <Link 
                to="/codigos" 
                className="text-law-accent hover:text-law-accent/80 underline underline-offset-4 transition-colors hover:scale-105 inline-flex items-center gap-1"
              >
                Ver todos
              </Link>
            </motion.div>
          </motion.div>
        </section>
        
        {/* Audio playback indicator */}
        {isAudioPlaying && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 bg-law-accent/90 p-3 rounded-full shadow-lg animate-pulse"
          >
            <Link to="/audio-comentarios" className="flex items-center gap-2">
              <Volume className="h-5 w-5 text-white" />
              <span className="text-white text-sm font-medium hidden md:inline-block">
                Reproduzindo áudio
              </span>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
