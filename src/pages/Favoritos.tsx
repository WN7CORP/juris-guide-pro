
import { useState } from "react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { legalCodes, Article } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <h2 className="text-2xl font-serif font-bold text-law mb-6">
          Artigos Favoritos
        </h2>
        
        {favorites.length === 0 ? (
          <div className="bg-accent p-6 rounded-lg text-center">
            <p className="text-gray-700 mb-2">
              Você ainda não adicionou artigos aos favoritos.
            </p>
            <p className="text-gray-600">
              Navegue pelos códigos e utilize o ícone de favorito para salvar artigos para consulta rápida.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.values(articlesByCode).map(({ code, articles }) => (
              <div key={code.id} className="mb-8">
                <h3 className="text-xl font-serif font-medium text-law-light mb-4 pb-2 border-b">
                  {code.title}
                </h3>
                <div className="space-y-8">
                  {articles.map(article => (
                    <ArticleView 
                      key={article.id} 
                      article={article}
                      onNarrate={() => {}} // Added missing prop
                    />
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
