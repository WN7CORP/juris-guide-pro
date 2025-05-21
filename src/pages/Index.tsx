
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Volume, Scale, Gavel, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

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

  // Separar códigos de estatutos e outras categorias
  const codesByCategory = legalCodes.reduce((acc, code) => {
    if (!acc[code.category]) {
      acc[code.category] = [];
    }
    acc[code.category].push(code);
    return acc;
  }, {} as Record<string, typeof legalCodes>);

  // Pegar as estatísticas
  const stats = {
    totalCodes: legalCodes.filter(c => c.category === 'código').length,
    totalStatutes: legalCodes.filter(c => c.category === 'estatuto').length,
    totalLaws: legalCodes.filter(c => c.category === 'lei').length,
    mostArticles: [...legalCodes].sort((a, b) => b.articles.length - a.articles.length)[0],
    fewestArticles: [...legalCodes].sort((a, b) => a.articles.length - b.articles.length)[0]
  };

  // Determina quais códigos mostrar com base na aba ativa
  const getFilteredCodes = () => {
    if (activeTab === "all") return legalCodes;
    return legalCodes.filter(code => code.category === activeTab);
  };

  // Códigos filtrados pela aba ativa
  const filteredCodes = getFilteredCodes();

  return <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6">
        <section className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            Vade Mecum Digital
          </h1>
          <p className="text-gray-300 mb-4">
            Seu guia jurídico completo com todos os códigos, estatutos e leis principais do Brasil.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-netflix-dark border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Scale className="mr-2 h-5 w-5 text-law-accent" />
                  Códigos e Legislações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Códigos:</span>
                    <Badge variant="outline" className="bg-law-accent/10 text-law-accent border-law-accent/30">
                      {stats.totalCodes}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estatutos:</span>
                    <Badge variant="outline" className="bg-netflix-red/10 text-netflix-red border-netflix-red/30">
                      {stats.totalStatutes}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Leis:</span>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      {stats.totalLaws}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-netflix-dark border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ArrowUp className="mr-2 h-5 w-5 text-green-500" />
                  Mais Extenso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-netflix-red font-semibold">{stats.mostArticles.title}</div>
                  <div className="text-sm text-gray-400">{stats.mostArticles.articles.length} artigos</div>
                  <Link to={`/codigos/${stats.mostArticles.id}`} className="text-sm text-law-accent hover:underline mt-2">
                    Ver código completo
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-netflix-dark border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ArrowDown className="mr-2 h-5 w-5 text-blue-500" />
                  Mais Compacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-netflix-red font-semibold">{stats.fewestArticles.title}</div>
                  <div className="text-sm text-gray-400">{stats.fewestArticles.articles.length} artigos</div>
                  <Link to={`/codigos/${stats.fewestArticles.id}`} className="text-sm text-law-accent hover:underline mt-2">
                    Ver código completo
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs para filtrar por categoria */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full text-sm ${
              activeTab === "all" 
                ? "bg-netflix-red text-white" 
                : "bg-netflix-dark border border-gray-800 text-gray-300 hover:bg-gray-800"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab("código")}
            className={`px-4 py-2 rounded-full text-sm flex items-center ${
              activeTab === "código" 
                ? "bg-netflix-red text-white" 
                : "bg-netflix-dark border border-gray-800 text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Scale className="mr-2 h-4 w-4" /> Códigos
          </button>
          <button
            onClick={() => setActiveTab("estatuto")}
            className={`px-4 py-2 rounded-full text-sm flex items-center ${
              activeTab === "estatuto" 
                ? "bg-netflix-red text-white" 
                : "bg-netflix-dark border border-gray-800 text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Gavel className="mr-2 h-4 w-4" /> Estatutos
          </button>
          <button
            onClick={() => setActiveTab("lei")}
            className={`px-4 py-2 rounded-full text-sm ${
              activeTab === "lei" 
                ? "bg-netflix-red text-white" 
                : "bg-netflix-dark border border-gray-800 text-gray-300 hover:bg-gray-800"
            }`}
          >
            Leis
          </button>
        </div>

        {/* Display codes based on active tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCodes.map(code => (
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
