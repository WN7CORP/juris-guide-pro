
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Volume, Scale, Gavel, Headphones, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecentViewStore } from "@/store/recentViewStore";

const Index = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { recentArticles } = useRecentViewStore();

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

  // Format date to readable format
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6">
        <section className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            Vade Mecum Digital
          </h1>
          <p className="text-gray-300 mb-6">
            Seu guia jurídico completo com todos os códigos, estatutos e leis principais do Brasil.
          </p>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link 
              to="/codigos?filter=código" 
              className="bg-netflix-dark border border-gray-800 rounded-lg p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:bg-gray-900"
            >
              <Scale className="h-12 w-12 text-law-accent mb-3" />
              <h3 className="text-lg font-medium text-white">Códigos</h3>
            </Link>

            <Link 
              to="/codigos?filter=estatuto" 
              className="bg-netflix-dark border border-gray-800 rounded-lg p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:bg-gray-900"
            >
              <Gavel className="h-12 w-12 text-netflix-red mb-3" />
              <h3 className="text-lg font-medium text-white">Estatutos</h3>
            </Link>

            <Link 
              to="/audio-comentarios" 
              className="bg-netflix-dark border border-gray-800 rounded-lg p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:bg-gray-900"
            >
              <Headphones className="h-12 w-12 text-blue-500 mb-3" />
              <h3 className="text-lg font-medium text-white">Comentários</h3>
            </Link>

            <Link 
              to="/favoritos" 
              className="bg-netflix-dark border border-gray-800 rounded-lg p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:bg-gray-900"
            >
              <Bookmark className="h-12 w-12 text-yellow-500 mb-3" />
              <h3 className="text-lg font-medium text-white">Favoritos</h3>
            </Link>
          </div>

          {/* Recent Articles */}
          {recentArticles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-law-accent mb-4">
                Artigos Recentes
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentArticles.map((article) => (
                  <Link 
                    key={`${article.codeId}-${article.id}`}
                    to={`/codigos/${article.codeId}?article=${article.id}`}
                    className="block"
                  >
                    <Card className="bg-netflix-dark border-gray-800 hover:border-gray-700 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-netflix-red font-medium">Art. {article.articleNumber}</h3>
                            <p className="text-sm text-gray-400">{article.codeTitle}</p>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(article.viewedAt)}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{article.content}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Display codes grid */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-law-accent mb-4">
              Todos os Códigos e Estatutos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {legalCodes.map(code => (
                <Link 
                  key={code.id} 
                  to={`/codigos/${code.id}`} 
                  className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect"
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
                  <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                      {code.shortTitle}
                    </span>
                    <span className="text-xs text-gray-500">
                      {code.articles.length} artigos
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Audio playback indicator */}
        {isAudioPlaying && (
          <div className="fixed bottom-4 right-4 bg-law-accent/90 p-3 rounded-full shadow-lg animate-pulse">
            <Link 
              to="/audio-comentarios" 
              className="flex items-center gap-2"
            >
              <Volume className="h-5 w-5 text-white" />
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
