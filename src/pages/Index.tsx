import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { Volume, BookOpen, Search, Bookmark, Home as HomeIcon } from "lucide-react";
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
  return <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-16 md:pb-6 px-[12px]">
        <section className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            Vade Mecum Digital
          </h2>
          <p className="text-gray-300 mb-4">
            Bem-vindo ao seu guia jurídico digital. Acesse os principais códigos e estatutos com explicações e exemplos práticos.
          </p>
        </section>

        {/* Navegação Principal */}
        <section className="mb-12 animate-fade-in" style={{
        animationDelay: "0.1s"
      }}>
          <h3 className="text-xl font-serif font-bold text-gray-200 mb-6 flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-netflix-red" />
            <span>Navegação</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link to="/codigos" className="bg-netflix-dark border border-gray-800 rounded-lg p-6 text-center hover:scale-105 transition-all duration-300 flex flex-col items-center hover:border-netflix-red hover:shadow-lg">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-4">
                <BookOpen className="h-8 w-8 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-200 mb-1">Códigos</h3>
              <p className="text-sm text-gray-400">Acesse os principais códigos jurídicos</p>
            </Link>

            <Link to="/estatutos" className="bg-netflix-dark border border-gray-800 rounded-lg p-6 text-center hover:scale-105 transition-all duration-300 flex flex-col items-center hover:border-netflix-red hover:shadow-lg">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-4">
                <BookOpen className="h-8 w-8 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-200 mb-1">Estatutos</h3>
              <p className="text-sm text-gray-400">Leis específicas e estatutos</p>
            </Link>

            <Link to="/comentados" className="bg-netflix-dark border border-gray-800 rounded-lg p-6 text-center hover:scale-105 transition-all duration-300 flex flex-col items-center hover:border-netflix-red hover:shadow-lg group animate-pulse-soft">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-4 group-hover:bg-netflix-red/20">
                <Volume className="h-8 w-8 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-200 mb-1">Comentados</h3>
              <p className="text-sm text-gray-400">Artigos com explicações em áudio</p>
            </Link>

            <Link to="/pesquisar" className="bg-netflix-dark border border-gray-800 rounded-lg p-6 text-center hover:scale-105 transition-all duration-300 flex flex-col items-center hover:border-netflix-red hover:shadow-lg">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-4">
                <Search className="h-8 w-8 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-200 mb-1">Pesquisar</h3>
              <p className="text-sm text-gray-400">Busca avançada em todos os textos</p>
            </Link>

            <Link to="/favoritos" className="bg-netflix-dark border border-gray-800 rounded-lg p-6 text-center hover:scale-105 transition-all duration-300 flex flex-col items-center hover:border-netflix-red hover:shadow-lg">
              <div className="p-4 rounded-full bg-netflix-red/10 mb-4">
                <Bookmark className="h-8 w-8 text-netflix-red" />
              </div>
              <h3 className="font-semibold text-gray-200 mb-1">Favoritos</h3>
              <p className="text-sm text-gray-400">Seus artigos salvos</p>
            </Link>
          </div>
        </section>

        {/* Códigos Populares */}
        <section className="mb-12 animate-fade-in" style={{
        animationDelay: "0.2s"
      }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold text-gray-200 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-netflix-red" />
              <span>Códigos Populares</span>
            </h3>
            <Link to="/codigos">
              <Button variant="ghost" size="sm" className="text-sm text-netflix-red hover:text-white">
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {codigos.slice(0, 3).map((code, index) => <Link key={code.id} to={`/codigos/${code.id}`} className="card-glow p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-700 animate-fade-in" style={{
            animationDelay: `${0.1 + index * 0.05}s`
          }}>
                <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded mt-2">
                  {code.shortTitle}
                </span>
              </Link>)}
          </div>
        </section>

        {/* Artigos Comentados em Áudio */}
        <section className="animate-fade-in" style={{
        animationDelay: "0.3s"
      }}>
          <div className="bg-netflix-dark border border-gray-800 rounded-xl overflow-hidden">
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
              {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-netflix-bg animate-pulse rounded-lg"></div>)}
                </div> : featuredArticles.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredArticles.map((article, index) => <Link key={article.id} to={`/comentados?article=${article.id}&table=Código_Penal`} className="group bg-netflix-bg hover:bg-netflix-bg/80 border border-gray-800 hover:border-gray-700 p-4 rounded-lg transition-all duration-300 animate-fade-in" style={{
                animationDelay: `${0.3 + index * 0.1}s`
              }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-full bg-netflix-red/10 text-netflix-red">
                          <Volume className="h-4 w-4" />
                        </div>
                        <h4 className="font-medium">
                          {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{article.artigo}</p>
                      <span className="mt-3 inline-block text-xs font-medium text-netflix-red group-hover:text-white transition-colors">
                        Código Penal
                      </span>
                    </Link>)}
                </div> : <div className="text-center py-8 px-4">
                  <Volume className="h-12 w-12 text-netflix-red/50 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-300 mb-2">Nenhum comentário em áudio disponível</h4>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Novos comentários em áudio serão adicionados em breve. Visite a seção regularmente para conteúdo atualizado.
                  </p>
                </div>}
            </div>
          </div>
        </section>
      </main>
      
      <FloatingMenu />
    </div>;
};
export default Index;