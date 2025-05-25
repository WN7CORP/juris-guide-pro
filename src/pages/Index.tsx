
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Volume, Scale, Gavel, Headphones, Bookmark, Sparkles, FileText, Crown, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useFavoritesStore } from "@/store/favoritesStore";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { StatisticsCounter } from "@/components/StatisticsCounter";

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

  // Featured categories - Constituição em destaque, outros reorganizados
  const categories = [
    {
      id: "constituicao",
      title: "Constituição Federal",
      icon: Crown,
      color: "text-yellow-400",
      bgColor: "bg-gradient-to-br from-yellow-500/30 via-amber-500/20 to-orange-500/10",
      borderColor: "border-yellow-500/40",
      description: "A Carta Magna do Brasil",
      path: "/codigos/constituicao-federal",
      featured: true,
      badge: "Carta Magna"
    },
    {
      id: "codigos",
      title: "Códigos",
      icon: Scale,
      color: "text-law-accent",
      bgColor: "bg-gradient-to-br from-law-accent/20 to-law-accent/5",
      borderColor: "border-law-accent/30",
      description: "Acesse todos os códigos legais",
      path: "/codigos?filter=código"
    },
    {
      id: "leis",
      title: "Leis",
      icon: FileText,
      color: "text-amber-400",
      bgColor: "bg-gradient-to-br from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/30",
      description: "Principais leis brasileiras",
      path: "/codigos?filter=lei"
    },
    {
      id: "comentarios",
      title: "Comentários",
      icon: Headphones,
      color: "text-blue-400",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      description: "Ouça comentários em áudio",
      path: "/audio-comentarios"
    },
    {
      id: "estatutos",
      title: "Estatutos",
      icon: Gavel,
      color: "text-netflix-red",
      bgColor: "bg-gradient-to-br from-netflix-red/20 to-netflix-red/5",
      borderColor: "border-netflix-red/30",
      description: "Consulte os estatutos importantes",
      path: "/codigos?filter=estatuto"
    },
    {
      id: "favoritos",
      title: "Favoritos",
      icon: Bookmark,
      color: "text-green-400",
      bgColor: "bg-gradient-to-br from-green-500/20 to-green-500/5",
      borderColor: "border-green-500/30",
      description: "Seus artigos salvos",
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
        {/* Enhanced Hero Section */}
        <section className="mb-8">
          <motion.div 
            className="mb-6 bg-gradient-to-r from-law-accent/20 via-netflix-red/20 to-amber-500/10 p-8 rounded-2xl border border-gray-800/40 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-law-accent/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-netflix-red/10 to-transparent rounded-full translate-y-12 -translate-x-12" />
            
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-netflix-red text-shadow-sm mb-2">
                    Vade Mecum Digital
                  </h1>
                  <p className="text-xl text-gray-300 mb-4">
                    Seu guia jurídico completo e inteligente
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-12 w-12 text-law-accent" />
                </motion.div>
              </div>

              {/* Global Search Bar */}
              <GlobalSearchBar />
              
              {/* Statistics */}
              <StatisticsCounter />
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-serif font-bold text-law-accent mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Acesso Rápido
            </h2>
            
            {/* Categories Grid */}
            <motion.div 
              variants={container} 
              initial="hidden" 
              animate="show" 
              className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
            >
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <motion.div 
                    key={category.id} 
                    variants={item}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    className={category.featured ? "md:col-span-2" : "col-span-1"}
                  >
                    <Link to={category.path} className="block h-full">
                      <Card className={`bg-netflix-dark border-gray-800 h-full shadow-lg hover:shadow-xl transition-all duration-300 ${category.borderColor} border overflow-hidden ${category.featured ? 'min-h-[140px]' : ''}`}>
                        <CardContent className={`${category.featured ? 'p-6 md:p-8' : 'p-4 md:p-6'} flex ${category.featured ? 'md:flex-row md:items-center' : 'flex-col'} items-center text-center ${category.featured ? 'md:text-left' : ''} h-full`}>
                          <div className={`${category.bgColor} ${category.borderColor} border p-3 rounded-full ${category.featured ? 'mb-0 md:mr-6' : 'my-2 md:my-3'} shadow-glow-sm relative`}>
                            <IconComponent className={`${category.featured ? 'h-8 w-8 md:h-10 md:w-10' : 'h-6 w-6 md:h-8 md:w-8'} ${category.color}`} />
                            {category.badge && (
                              <span className={`absolute -top-2 -right-2 ${category.featured ? 'bg-yellow-500' : 'bg-netflix-red'} text-white text-xs font-bold rounded-full ${category.featured ? 'h-6 w-auto px-2' : 'h-5 w-5'} flex items-center justify-center`}>
                                {category.badge}
                              </span>
                            )}
                          </div>
                          <div className={category.featured ? 'flex-1' : ''}>
                            <h3 className={`font-serif font-semibold ${category.featured ? 'text-xl md:text-2xl' : 'text-base md:text-xl'} text-netflix-red mt-1 md:mt-2`}>
                              {category.title}
                            </h3>
                            <p className={`text-xs md:text-sm text-gray-400 mt-1 ${category.featured ? 'block' : 'hidden md:block'}`}>
                              {category.description}
                            </p>
                            {category.featured && (
                              <div className="mt-3 flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm text-yellow-400 font-medium">
                                  Documento fundamental
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </section>
        
        {/* Recent Codes */}
        {recentVisitedCodes.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-xl font-serif font-bold text-law-accent mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Visitados Recentemente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentVisitedCodes.map((code, index) => code && (
                <motion.div 
                  key={code.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link 
                    to={`/codigos/${code.id}`} 
                    className="block p-4 bg-netflix-dark border border-gray-800 rounded-lg hover:bg-netflix-dark/70 transition-all duration-300 hover:border-law-accent/50"
                  >
                    <h3 className="font-medium text-netflix-red mb-2">{code.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{code.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Featured Legal Codes */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <h2 className="text-2xl font-serif font-bold text-law-accent mb-6 text-shadow-sm flex items-center">
              <Scale className="mr-2 h-6 w-6" />
              Principais Legislações
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
                    className="p-4 bg-gradient-to-br from-netflix-dark to-netflix-bg border border-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:border-law-accent/30"
                  >
                    <div className="flex items-center mb-3">
                      {code.category === 'código' ? (
                        <Scale className="mr-2 h-5 w-5 text-law-accent" />
                      ) : code.category === 'estatuto' ? (
                        <Gavel className="mr-2 h-5 w-5 text-netflix-red" />
                      ) : (
                        <FileText className="mr-2 h-5 w-5 text-amber-400" />
                      )}
                      <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 flex-grow leading-relaxed">
                      {code.description}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-3 py-1 rounded-full">
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
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex justify-center mt-8"
            >
              <Link 
                to="/codigos" 
                className="text-law-accent hover:text-law-accent/80 underline underline-offset-4 transition-colors hover:scale-105 inline-flex items-center gap-1 font-medium"
              >
                Ver todas as legislações
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
            className="fixed bottom-4 right-4 bg-law-accent/90 p-3 rounded-full shadow-lg animate-pulse z-40"
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
