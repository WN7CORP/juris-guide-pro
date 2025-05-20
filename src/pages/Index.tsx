
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { useEffect, useState } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Volume } from "lucide-react";

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

  return <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 py-[22px] px-[16px]">
        <section className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            Vade Mecum Digital
          </h2>
          <p className="text-gray-300 mb-4">
            Bem-vindo ao seu guia jurídico digital. Acesse os principais códigos e estatutos com explicações e exemplos práticos.
          </p>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-serif font-bold text-gray-200 mb-4">
            Códigos e Estatutos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalCodes.map(code => <Link key={code.id} to={`/codigos/${code.id}`} className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect">
                <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded mt-2">
                  {code.shortTitle}
                </span>
              </Link>)}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-serif font-bold text-gray-200 mb-4">
            Recursos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/favoritos" className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect">
              <h4 className="font-semibold text-netflix-red">Artigos Favoritos</h4>
              <p className="text-sm text-gray-400 mt-1">
                Acesse seus artigos salvos para consulta rápida.
              </p>
            </Link>
            <Link to="/pesquisar" className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect">
              <h4 className="font-semibold text-netflix-red">Pesquisar</h4>
              <p className="text-sm text-gray-400 mt-1">
                Encontre conteúdos específicos em todos os códigos.
              </p>
            </Link>
          </div>
        </section>
        
        {/* Audio playback indicator */}
        {isAudioPlaying && (
          <div className="fixed bottom-24 md:bottom-4 right-4 bg-law-accent/90 p-3 rounded-full shadow-lg animate-pulse">
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
      
      <MobileFooter />
    </div>;
};

export default Index;
