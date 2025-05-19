
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { Volume, BookOpen, Search, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { FloatingMenu } from "@/components/FloatingMenu";
import { Button } from "@/components/ui/button";
import { fetchArticlesWithAudioComments } from "@/services/legalCodeService";

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
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <section className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            Vade Mecum Digital
          </h2>
          <p className="text-gray-300 mb-4">
            Bem-vindo ao seu guia jurídico digital. Acesse os principais códigos e estatutos com explicações e exemplos práticos.
          </p>
        </section>

        {/* Featured Commented Articles */}
        <section className="mb-12 bg-netflix-dark border border-gray-800 rounded-xl overflow-hidden">
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
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-netflix-bg animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredArticles.map((article) => (
                  <Link 
                    key={article.id}
                    to={`/codigos/codigo-penal?article=${article.id}`}
                    className="group bg-netflix-bg hover:bg-netflix-bg/80 border border-gray-800 hover:border-gray-700 p-4 rounded-lg transition-all duration-300"
                  >
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
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">
                Novos comentários em áudio serão adicionados em breve.
              </p>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-serif font-bold text-gray-200 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-netflix-red" />
            <span>Códigos e Estatutos</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalCodes.map((code) => (
              <Link
                key={code.id}
                to={`/codigos/${code.id}`}
                className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-700"
              >
                <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded mt-2">
                  {code.shortTitle}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-serif font-bold text-gray-200 mb-4">
            Recursos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/favoritos"
              className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-gray-700 flex items-center gap-4"
            >
              <div className="p-3 rounded-full bg-netflix-red/10 text-netflix-red">
                <Bookmark className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-netflix-red">Artigos Favoritos</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Acesse seus artigos salvos para consulta rápida.
                </p>
              </div>
            </Link>
            <Link
              to="/pesquisar"
              className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-gray-700 flex items-center gap-4"
            >
              <div className="p-3 rounded-full bg-netflix-red/10 text-netflix-red">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-netflix-red">Pesquisar</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Encontre conteúdos específicos em todos os códigos.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>
      
      <FloatingMenu />
    </div>
  );
};

export default Index;
