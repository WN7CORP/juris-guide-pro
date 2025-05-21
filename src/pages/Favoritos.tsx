
import { useFavoritesStore } from "@/store/favoritesStore";
import { legalCodes, Article } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";
import { BookMarked, Scale, BookOpen } from "lucide-react";

const Favoritos = () => {
  const { favorites } = useFavoritesStore();
  
  // Get all articles from all codes
  const allArticles = legalCodes.flatMap(code => code.articles);
  
  // Filter only favorited articles
  const favoritedArticles = allArticles.filter(article => 
    favorites.includes(article.id)
  );
  
  // Group articles by their code
  const articlesByCode: Record<string, {code: typeof legalCodes[0], articles: Article[]}> = {};
  
  favoritedArticles.forEach(article => {
    const codeId = article.id.split("-")[0]; // Extract code prefix (e.g., "cf", "cc")
    const code = legalCodes.find(c => c.id.startsWith(codeId));
    
    if (code) {
      if (!articlesByCode[code.id]) {
        articlesByCode[code.id] = { code, articles: [] };
      }
      articlesByCode[code.id].articles.push(article);
    }
  });

  // Get code icon by id
  const getCodeIcon = (codeId: string) => {
    if (codeId.includes('civil')) return <BookOpen className="h-5 w-5 text-blue-400" />;
    if (codeId.includes('penal')) return <Scale className="h-5 w-5 text-red-400" />;
    return <BookMarked className="h-5 w-5 text-amber-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6 animate-fade-in">
        <h2 className="favorites-header">
          <BookMarked className="h-6 w-6 text-law-accent" />
          Artigos Favoritos
        </h2>
        
        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <p className="text-gray-300 mb-4 text-lg">
              Você ainda não adicionou artigos aos favoritos.
            </p>
            <p className="text-gray-400">
              Navegue pelos códigos e utilize o ícone de favorito para salvar artigos para consulta rápida.
            </p>
          </div>
        ) : (
          <div className="favorites-container">
            {Object.values(articlesByCode).map(({ code, articles }) => (
              <div key={code.id} className="mb-8 bg-gray-800/20 p-4 rounded-lg border border-gray-800/50 animate-fade-in">
                <h3 className="favorites-code-title">
                  {getCodeIcon(code.id)}
                  {code.title}
                </h3>
                <div className="space-y-8">
                  {articles.map(article => (
                    <ArticleView key={article.id} article={article} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Favoritos;
