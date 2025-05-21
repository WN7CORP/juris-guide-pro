
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Volume, Scale, Gavel, Headphones, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
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

  // Categories that we'll display as cards
  const categories = [
    {
      id: "codigos",
      title: "Códigos",
      icon: Scale,
      color: "text-law-accent",
      bgColor: "bg-law-accent/10",
      borderColor: "border-law-accent/30",
      description: "Acesse todos os códigos legais brasileiros",
      path: "/codigos?filter=código"
    },
    {
      id: "estatutos",
      title: "Estatutos",
      icon: Gavel,
      color: "text-netflix-red",
      bgColor: "bg-netflix-red/10",
      borderColor: "border-netflix-red/30",
      description: "Consulte os estatutos mais importantes",
      path: "/codigos?filter=estatuto"
    },
    {
      id: "comentarios",
      title: "Comentários",
      icon: Headphones,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10", 
      borderColor: "border-blue-500/30",
      description: "Ouça comentários em áudio dos artigos",
      path: "/audio-comentarios"
    },
    {
      id: "favoritos",
      title: "Favoritos",
      icon: Bookmark,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      description: "Acesse seus artigos favoritos",
      path: "/favoritos"
    }
  ];

  return <div className="min-h-screen flex flex-col dark">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link 
                  key={category.id}
                  to={category.path} 
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="bg-netflix-dark border-gray-800 h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className={`p-3 rounded-full ${category.bgColor} ${category.borderColor} border`}>
                          <Icon className={`h-8 w-8 ${category.color}`} />
                        </div>
                        <h3 className="font-serif font-semibold text-xl text-netflix-red">{category.title}</h3>
                        <p className="text-sm text-gray-400">{category.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Display codes */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-law-accent mb-4">
            Legislações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalCodes.slice(0, 9).map(code => (
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
          
          <div className="flex justify-center mt-4">
            <Link 
              to="/codigos" 
              className="text-law-accent hover:text-law-accent/80 underline underline-offset-4"
            >
              Ver todos
            </Link>
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
    </div>;
};

export default Index;
