import { useFavoritesStore } from "@/store/favoritesStore";
import { legalCodes, Article } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";
import { BookMarked, Scale, BookOpen, Bookmark, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LegalArticle } from "@/services/legalCodeService";
import { KNOWN_TABLES } from "@/utils/tableMapping";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { categorizeLegalCode } from "@/utils/formatters";

// Extended Article type to include audio commentary
interface ExtendedArticle extends Article {
  comentario_audio?: string;
  formalExplanation?: string;
}

// Category type for organizing favorites
type LegalCategory = "códigos" | "estatutos" | "constituição" | "leis" | "todos";

// Função para fazer cast seguro do nome da tabela para fins de tipagem
function safeTableCast(tableName: string) {
  // Usamos 'as any' aqui para contornar a limitação de tipagem do Supabase
  return tableName as any;
}

// Helper function to convert Supabase article to our application format
const convertSupabaseArticle = (article: Record<string, any>, codeId: string): ExtendedArticle => {
  return {
    id: article.id?.toString() || '',
    number: article.numero || '',
    content: article.artigo || '',
    explanation: article.tecnica,
    formalExplanation: article.formal,
    practicalExample: article.exemplo,
    comentario_audio: article.comentario_audio,
  };
};

const Favoritos = () => {
  const { favorites, normalizeId } = useFavoritesStore();
  const [favoritedArticles, setFavoritedArticles] = useState<ExtendedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory>("todos");
  
  // Fetch favorited articles from both static and Supabase data
  const fetchFavoritedArticles = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // 1. Collect articles from static data
      const staticArticles = legalCodes.flatMap(code => code.articles)
        .filter(article => favorites.includes(normalizeId(article.id)));
      
      // 2. Fetch articles from Supabase that match favorited IDs
      const supabaseArticles: ExtendedArticle[] = [];
      
      // Get numeric favorite IDs to search for in Supabase tables
      const numericFavoriteIds = favorites
        .filter(id => !isNaN(Number(id)))
        .map(id => Number(id));
      
      // If we have numeric favorite IDs, query each known table
      if (numericFavoriteIds.length > 0) {
        // Prepare to fetch in batches for better performance
        const batchSize = 10; // Maximum number of tables to query in parallel
        
        // Process known tables in batches
        for (let i = 0; i < KNOWN_TABLES.length; i += batchSize) {
          const batchTables = KNOWN_TABLES.slice(i, i + batchSize);
          
          // Process this batch of tables in parallel
          const batchPromises = batchTables.map(async (tableName) => {
            try {
              // Check if the table exists first
              if (!tableName) return null;
              
              const { data, error } = await supabase
                .from(safeTableCast(tableName))
                .select('*')
                .in('id', numericFavoriteIds);
              
              if (error) {
                console.error(`Error querying table ${tableName}:`, error);
                return null;
              }
              
              if (data && data.length > 0) {
                // Convert Supabase articles to our application format
                return data.map(item => 
                  convertSupabaseArticle(item, tableName)
                );
              }
              
              return null;
            } catch (err) {
              console.error(`Error fetching from table ${tableName}:`, err);
              return null;
            }
          });
          
          // Wait for all promises in this batch
          const batchResults = await Promise.all(batchPromises);
          
          // Add non-null results to supabaseArticles
          batchResults.forEach(articles => {
            if (articles && articles.length > 0) {
              supabaseArticles.push(...articles);
            }
          });
        }
      }
      
      // 3. Combine static and Supabase articles
      const allArticles = [...staticArticles, ...supabaseArticles];
      console.log('Total favorited articles found:', allArticles.length);
      
      // Remove duplicates if any
      const uniqueArticles = Array.from(
        new Map(allArticles.map(article => [article.id, article])).values()
      );
      
      setFavoritedArticles(uniqueArticles);
    } catch (err) {
      console.error('Error fetching favorited articles:', err);
      toast.error('Erro ao carregar favoritos');
    } finally {
      setIsLoading(false);
    }
  }, [favorites, normalizeId]);
  
  useEffect(() => {
    fetchFavoritedArticles();
  }, [fetchFavoritedArticles]);
  
  // Group articles by their category and code
  const categorizedArticles = favoritedArticles.reduce((acc, article) => {
    let codeId = '';
    let codeTitle = '';
    let category: LegalCategory = 'leis';
    
    // Try to extract code ID from article ID format (e.g., "cf-art-1")
    if (typeof article.id === 'string' && article.id.includes('-')) {
      const parts = article.id.split('-');
      codeId = parts[0];
      
      // Find matching code in legalCodes
      const matchingCode = legalCodes.find(c => c.id === codeId || c.id.includes(codeId));
      if (matchingCode) {
        codeTitle = matchingCode.title;
        
        // Determine category
        category = categorizeLegalCode(codeId);
      } else {
        // Fallback title
        codeTitle = codeId.toUpperCase();
      }
    } else {
      // For numeric IDs without code prefix, use a default category
      codeId = 'outros';
      codeTitle = 'Outros Artigos';
      category = 'leis';
    }
    
    // Create category if it doesn't exist
    if (!acc[category]) {
      acc[category] = {};
    }
    
    // Create code within category if it doesn't exist
    if (!acc[category][codeId]) {
      acc[category][codeId] = { 
        code: { id: codeId, title: codeTitle }, 
        articles: [] 
      };
    }
    
    acc[category][codeId].articles.push(article);
    return acc;
  }, {} as Record<LegalCategory, Record<string, {code: {id: string, title: string}, articles: ExtendedArticle[]}>>);
  
  // Collect all codes across categories for "Todos" tab
  const allCategorizedCodes = Object.values(categorizedArticles).reduce((acc, codeMap) => {
    Object.values(codeMap).forEach(({ code, articles }) => {
      if (!acc[code.id]) {
        acc[code.id] = { code, articles: [] };
      }
      acc[code.id].articles.push(...articles);
    });
    return acc;
  }, {} as Record<string, {code: {id: string, title: string}, articles: ExtendedArticle[]}>);

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
    if (codeId.includes('civil') || codeId.includes('cc')) return <BookOpen className="h-5 w-5 text-blue-400" />;
    if (codeId.includes('penal') || codeId.includes('cp')) return <Scale className="h-5 w-5 text-red-400" />;
    if (codeId.includes('constituicao') || codeId.includes('cf')) return <FileText className="h-5 w-5 text-amber-500" />;
    return <BookMarked className="h-5 w-5 text-amber-400" />;
  };
  
  // Handle tab change
  const handleCategoryChange = (category: LegalCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen flex flex-col bg-netflix-bg animate-fade-in">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
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
        ) : favoritedArticles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-netflix-dark/50 rounded-lg border border-gray-800 p-8 text-center"
          >
            <Bookmark className="h-16 w-16 mx-auto text-gray-500 mb-4 opacity-50" />
            <p className="text-gray-300 mb-4 text-lg">
              Não foi possível encontrar os artigos favoritados.
            </p>
            <p className="text-gray-400">
              Pode ser que os artigos não estejam mais disponíveis ou houve um problema ao carregá-los.
            </p>
          </motion.div>
        ) : (
          <Tabs 
            defaultValue="todos" 
            className="w-full"
            onValueChange={(value) => handleCategoryChange(value as LegalCategory)}
          >
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="códigos" className="text-blue-400">
                <BookOpen className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Códigos</span>
              </TabsTrigger>
              <TabsTrigger value="estatutos" className="text-green-400">
                <BookMarked className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Estatutos</span>
              </TabsTrigger>
              <TabsTrigger value="constituição" className="text-amber-400">
                <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Constituição</span>
              </TabsTrigger>
              <TabsTrigger value="leis" className="text-red-400">
                <Scale className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Leis</span>
              </TabsTrigger>
            </TabsList>

            {/* All favorites tab */}
            <TabsContent value="todos">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {Object.values(allCategorizedCodes).length > 0 ? (
                  Object.values(allCategorizedCodes).map(({ code, articles }) => (
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
                  ))
                ) : (
                  <motion.div
                    variants={item}
                    className="text-center py-8 text-gray-400"
                  >
                    Nenhum artigo favorito encontrado.
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Category-specific tabs */}
            {(['códigos', 'estatutos', 'constituição', 'leis'] as LegalCategory[]).map(category => (
              <TabsContent key={category} value={category}>
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {categorizedArticles[category] && Object.keys(categorizedArticles[category]).length > 0 ? (
                    Object.values(categorizedArticles[category]).map(({ code, articles }) => (
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
                    ))
                  ) : (
                    <motion.div
                      variants={item}
                      className="text-center py-8 text-gray-400"
                    >
                      Nenhum artigo favorito encontrado nesta categoria.
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Favoritos;
