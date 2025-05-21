
import { useFavoritesStore } from "@/store/favoritesStore";
import { legalCodes, Article } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";
import { BookMarked, Scale, BookOpen, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Favoritos = () => {
  const { favorites } = useFavoritesStore();
  const [favoritedArticles, setFavoritedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get all articles from all codes and filter by favorites
  useEffect(() => {
    setIsLoading(true);
    
    // Collect all articles from all codes
    const allArticles = legalCodes.flatMap(code => code.articles);
    
    // Filter only favorited articles
    const articles = allArticles.filter(article => 
      favorites.includes(article.id)
    );
    
    setFavoritedArticles(articles);
    setIsLoading(false);
  }, [favorites]);
  
  // Group articles by their code
  const articlesByCode: Record<string, {code: typeof legalCodes[0], articles: Article[]}> = {};
  
  favoritedArticles.forEach(article => {
    const codeId = article.id.split("-")[0]; // Extract code prefix (e.g., "cf", "cc")
    const code = legalCodes.find(c => c.id === codeId || article.id.startsWith(c.id));
    
    if (code) {
      if (!articlesByCode[code.id]) {
        articlesByCode[code.id] = { code, articles: [] };
      }
      articlesByCode[code.id].articles.push(article);
    }
  });

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Get code icon by id
  const getCodeIcon = (codeId: string) => {
    if (codeId.includes('civil')) return <BookOpen className="h-5 w-5 text-blue-400" />;
    if (codeId.includes('penal')) return <Scale className="h-5 w-5 text-red-400" />;
    return <BookMarked className="h-5 w-5 text-amber-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6 animate-fade-in">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-2xl font-serif font-bold text-law-accent mb-6 flex items-center gap-2"
        >
          <BookMarked className="h-6 w-6" />
          Artigos Favoritos
        </motion.h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-400">Carregando favoritos...</div>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-netflix-dark/50 rounded-lg border border-gray-800 p-8 text-center"
          >
            <Bookmark className="h-16 w-16 mx-auto text-gray-500 mb-4 opacity-50" />
            <p className="text-gray-300 mb-4 text-lg">
              Você ainda não adicionou artigos aos favoritos.
            </p>
            <p className="text-gray-400">
              Navegue pelos códigos e utilize o ícone <Bookmark className="h-4 w-4 inline-block mx-1" /> para salvar artigos para consulta rápida.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {Object.values(articlesByCode).map(({ code, articles }) => (
              <motion.div 
                key={code.id} 
                variants={item}
                className="mb-8 bg-netflix-dark/50 p-6 rounded-lg border border-gray-800/50 shadow-lg"
              >
                <h3 className="flex items-center gap-2 text-xl font-serif font-semibold text-netflix-red mb-4 pb-2 border-b border-gray-800/50">
                  {getCodeIcon(code.id)}
                  {code.title}
                  <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300">
                    {articles.length} {articles.length === 1 ? 'artigo' : 'artigos'}
                  </span>
                </h3>
                <div className="space-y-6">
                  {articles.map(article => (
                    <ArticleView key={article.id} article={article} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Favoritos;
