
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { BookOpen, Bookmark, Scale, Gavel, Headphones, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecentArticlesStore } from "@/store/recentArticlesStore";

const Index = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { recentArticles } = useRecentArticlesStore();

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

  // Category cards configuration
  const categoryCards = [
    {
      title: "Códigos",
      icon: Scale,
      description: "Acesse todos os códigos da legislação brasileira",
      path: "/codigos?filter=código",
      color: "from-blue-600 to-blue-800"
    },
    {
      title: "Estatutos",
      icon: Gavel,
      description: "Consulte os estatutos mais importantes",
      path: "/codigos?filter=estatuto",
      color: "from-red-600 to-red-800"
    },
    {
      title: "Comentários",
      icon: Headphones,
      description: "Ouça comentários em áudio dos artigos",
      path: "/audio-comentarios",
      color: "from-green-600 to-green-800"
    },
    {
      title: "Favoritos",
      icon: Bookmark,
      description: "Acesse seus artigos favoritos",
      path: "/favoritos",
      color: "from-purple-600 to-purple-800"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6">
        <section className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            Vade Mecum Digital
          </h1>
          <p className="text-gray-300 mb-6">
            Seu guia jurídico completo com códigos, estatutos e leis do Brasil.
          </p>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categoryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link 
                  key={card.title} 
                  to={card.path} 
                  className="block hover:scale-105 transition-transform duration-300"
                >
                  <Card className={`h-full bg-gradient-to-br ${card.color} border-none text-white overflow-hidden`}>
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="bg-white/20 rounded-full p-4 mb-4">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                      <p className="text-sm text-white/80">{card.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Articles Section */}
        {recentArticles.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-netflix-red" />
              <h2 className="text-xl font-serif font-bold text-netflix-red">
                Artigos Recentes
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentArticles.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/codigos/${article.codeId}?article=${article.id}`} 
                  className="p-4 bg-netflix-dark border border-gray-800 rounded-lg hover:border-law-accent transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-law-accent" />
                    <span className="text-law-accent font-medium">
                      Art. {article.number}
                    </span>
                  </div>
                  <h3 className="text-white text-sm mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {article.codeName}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(article.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* Audio playback indicator */}
        {isAudioPlaying && (
          <div className="fixed bottom-4 right-4 bg-law-accent/90 p-3 rounded-full shadow-lg animate-pulse">
            <Link 
              to="/audio-comentarios" 
              className="flex items-center gap-2"
            >
              <Headphones className="h-5 w-5 text-white" />
              <span className="text-white text-sm font-medium hidden md:inline-block">
                Reproduzindo áudio
              </span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
