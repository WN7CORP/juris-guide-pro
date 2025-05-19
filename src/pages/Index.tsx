
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { Volume, Scale, Gavel, Search, Bookmark, ArrowRight, Home as HomeIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { FloatingMenu } from "@/components/FloatingMenu";
import { Button } from "@/components/ui/button";
import { fetchArticlesWithAudioComments } from "@/services/legalCodeService";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        setLoading(true);
        // Fetch articles with audio comments from Código Penal as featured content
        const articles = await fetchArticlesWithAudioComments("Código_Penal");
        setFeaturedArticles(articles.slice(0, 3)); // Take up to 3 articles
      } catch (error) {
        console.error("Failed to load featured content:", error);
        toast.error("Falha ao carregar artigos comentados");
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedContent();
  }, []);

  // Filter codes to separate estatutos from códigos
  const codigos = legalCodes.filter(code => !code.title.toLowerCase().includes("estatuto"));
  const estatutos = legalCodes.filter(code => code.title.toLowerCase().includes("estatuto"));
  
  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-16 md:pb-6 px-[12px]">
        {/* Hero Section */}
        <section className="relative mb-10 animate-fade-in overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black/70 z-0"></div>
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589216532372-1c2a367900d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')] bg-cover bg-center opacity-20 z-[-1]"
            style={{ backgroundPosition: "center 25%" }}
          ></div>
          <div className="relative z-10 px-6 py-10 md:py-12 md:px-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                Vade Mecum Digital
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-6">
                Acesse os principais códigos e leis brasileiros com comentários, exemplos práticos e explicações em áudio.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/codigos">
                  <Button className="bg-netflix-red hover:bg-red-700 text-white gap-2 rounded-full px-6 py-5 h-auto">
                    <Scale className="h-5 w-5" />
                    <span>Códigos</span>
                  </Button>
                </Link>
                <Link to="/comentados">
                  <Button variant="outline" className="border-gray-600 text-white gap-2 hover:bg-gray-800 rounded-full px-6 py-5 h-auto">
                    <Volume className="h-5 w-5" />
                    <span>Artigos Comentados</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Navegação Principal */}
        <section className="mb-12 animate-fade-in" style={{animationDelay: "0.1s"}}>
          <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2 pl-1">
            <div className="h-6 w-1 bg-netflix-red rounded-full mr-2"></div>
            <span>Navegação</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/codigos" className="group overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-center transition-all duration-300 flex flex-col items-center border border-gray-800 hover:border-netflix-red hover:shadow-lg">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-6 group-hover:bg-netflix-red/20 transition-all duration-300 group-hover:scale-110">
                <Scale className="h-10 w-10 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">Códigos</h3>
              <p className="text-sm text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">Acesse os principais códigos jurídicos brasileiros</p>
              <div className="mt-auto">
                <span className="inline-flex items-center text-xs font-medium text-netflix-red group-hover:gap-1 transition-all">
                  Ver todos
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </div>
            </Link>

            <Link to="/estatutos" className="group overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-center transition-all duration-300 flex flex-col items-center border border-gray-800 hover:border-netflix-red hover:shadow-lg">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-6 group-hover:bg-netflix-red/20 transition-all duration-300 group-hover:scale-110">
                <Gavel className="h-10 w-10 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">Estatutos</h3>
              <p className="text-sm text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">Acesse estatutos e leis específicas</p>
              <div className="mt-auto">
                <span className="inline-flex items-center text-xs font-medium text-netflix-red group-hover:gap-1 transition-all">
                  Ver todos
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </div>
            </Link>

            <Link to="/comentados" className="group overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-center transition-all duration-300 flex flex-col items-center border border-gray-800 hover:border-netflix-red hover:shadow-lg animate-pulse-soft">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-6 group-hover:bg-netflix-red/20 transition-all duration-300 group-hover:scale-110 animate-glow">
                <Volume className="h-10 w-10 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">Comentados</h3>
              <p className="text-sm text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">Artigos com explicações em áudio</p>
              <div className="mt-auto">
                <span className="inline-flex items-center text-xs font-medium text-netflix-red group-hover:gap-1 transition-all">
                  Ouvir agora
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </div>
            </Link>

            <Link to="/favoritos" className="group overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-center transition-all duration-300 flex flex-col items-center border border-gray-800 hover:border-netflix-red hover:shadow-lg">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-6 group-hover:bg-netflix-red/20 transition-all duration-300 group-hover:scale-110">
                <Bookmark className="h-10 w-10 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">Favoritos</h3>
              <p className="text-sm text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">Seus artigos salvos para acesso rápido</p>
              <div className="mt-auto">
                <span className="inline-flex items-center text-xs font-medium text-netflix-red group-hover:gap-1 transition-all">
                  Ver favoritos
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Códigos Populares */}
        <section className="mb-12 animate-fade-in" style={{animationDelay: "0.2s"}}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2 pl-1">
              <div className="h-6 w-1 bg-netflix-red rounded-full mr-2"></div>
              <Scale className="h-5 w-5 text-netflix-red mr-1" />
              <span>Códigos Populares</span>
            </h3>
            <Link to="/codigos">
              <Button variant="ghost" size="sm" className="text-sm text-netflix-red hover:text-white">
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {codigos.slice(0, 3).map((code, index) => (
              <Link 
                key={code.id} 
                to={`/codigos/${code.id}`} 
                className="card-glow p-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-gray-700 animate-fade-in" 
                style={{animationDelay: `${0.1 + index * 0.05}s`}}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                  <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                    {code.shortTitle}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">{code.description}</p>
                <div className="mt-4 pt-2 border-t border-gray-800 flex justify-end">
                  <span className="text-xs text-netflix-red/80 flex items-center">
                    Acessar
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Artigos Comentados em Áudio */}
        <section className="animate-fade-in" style={{animationDelay: "0.3s"}}>
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Volume className="h-5 w-5 text-netflix-red" />
                <span>Artigos Comentados em Áudio</span>
              </h3>
              <Link to="/comentados">
                <Button variant="ghost" size="sm" className="text-sm text-netflix-red hover:text-white">
                  Ver todos
                </Button>
              </Link>
            </div>
            
            <div className="p-5">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-800/50 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : featuredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredArticles.map((article, index) => (
                    <Link 
                      key={article.id} 
                      to={`/comentados?article=${article.id}&table=Código_Penal`} 
                      className="group bg-gray-800/40 hover:bg-gray-800/60 border border-gray-800 hover:border-gray-700 p-4 rounded-lg transition-all duration-300 animate-fade-in" 
                      style={{animationDelay: `${0.3 + index * 0.1}s`}}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-full bg-netflix-red/10 text-netflix-red group-hover:bg-netflix-red/20 transition-all duration-300">
                          <Volume className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium">
                          {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">{article.artigo}</p>
                      <span className="mt-3 inline-block text-xs font-medium text-netflix-red group-hover:text-white transition-colors">
                        Código Penal
                      </span>
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="audio-wave flex gap-[2px] items-end">
                          <span className="w-[2px] h-2 bg-netflix-red rounded-full animate-pulse"></span>
                          <span className="w-[2px] h-3 bg-netflix-red rounded-full" style={{animationDelay: "0.1s"}}></span>
                          <span className="w-[2px] h-1 bg-netflix-red rounded-full" style={{animationDelay: "0.2s"}}></span>
                          <span className="w-[2px] h-2 bg-netflix-red rounded-full" style={{animationDelay: "0.15s"}}></span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <Volume className="h-12 w-12 text-netflix-red/50 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-300 mb-2">Nenhum comentário em áudio disponível</h4>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Novos comentários em áudio serão adicionados em breve. Visite a seção regularmente para conteúdo atualizado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <FloatingMenu />
    </div>
  );
};

export default Index;
