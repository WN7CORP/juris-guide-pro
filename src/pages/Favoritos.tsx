import { useFavoritesStore } from "@/store/favoritesStore";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { ArticleView } from "@/components/ArticleView";
import { BookMarked, Scale, BookOpen, Bookmark, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useMemo } from "react";
import { KNOWN_TABLES } from "@/utils/tableMapping";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { categorizeLegalCode, getLegalCodeIcon } from "@/utils/formatters";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

// Define a common interface that combines both article types
interface BaseArticle {
  id: string | number;
  numero?: string;
  title?: string;
  artigo?: string;
  content?: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  formalExplanation?: string;
  comentario_audio?: string;
}

// Extended Article type to include audio commentary
interface ExtendedArticle extends BaseArticle {
  artigo: string; // Required in ExtendedArticle
}

// Define interface for categorized articles
interface CategorizedArticles {
  códigos: Record<string, ExtendedArticle[]>;
  estatutos: Record<string, ExtendedArticle[]>;
  constituição: Record<string, ExtendedArticle[]>;
  leis: Record<string, ExtendedArticle[]>;
}

// Função para fazer cast seguro do nome da tabela para fins de tipagem
function safeTableCast(tableName: string) {
  // Usamos 'as any' aqui para contornar a limitação de tipagem do Supabase
  return tableName as any;
}

// Helper function to convert Supabase article to our application format
const convertSupabaseArticle = (article: Record<string, any>, codeId: string): ExtendedArticle => {
  return {
    id: article.id?.toString() || '',
    numero: article.numero || '',
    artigo: article.artigo || '',
    tecnica: article.tecnica,
    formal: article.formal,
    exemplo: article.exemplo,
    comentario_audio: article.comentario_audio,
  };
};

// Helper function to ensure type compatibility
const ensureExtendedArticle = (article: BaseArticle): ExtendedArticle => {
  return {
    ...article,
    artigo: article.artigo || article.content || '',
  };
};

const Favoritos = () => {
  const { favorites, normalizeId } = useFavoritesStore();
  const [favoritedArticles, setFavoritedArticles] = useState<ExtendedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'códigos' | 'estatutos' | 'constituição' | 'leis'>('códigos');
  const isMobile = useIsMobile();
  
  // Categorize articles by code type
  const categorizedArticles = useMemo(() => {
    const result: CategorizedArticles = {
      códigos: {},
      estatutos: {},
      constituição: {},
      leis: {}
    };
    
    // Group articles by their code
    const articlesByCode: Record<string, ExtendedArticle[]> = {};
    
    favoritedArticles.forEach(article => {
      let codeId = '';
      let codeTitle = '';
      
      // Try to extract code ID from article ID format (e.g., "cf-art-1")
      if (typeof article.id === 'string' && article.id.includes('-')) {
        const parts = article.id.split('-');
        codeId = parts[0];
        
        // Find matching code in legalCodes
        const matchingCode = legalCodes.find(c => c.id === codeId || c.id.includes(codeId));
        if (matchingCode) {
          codeTitle = matchingCode.title;
        } else {
          // Fallback title
          codeTitle = codeId.toUpperCase();
        }
      } else {
        // For numeric IDs without code prefix, use a default category
        codeId = 'outros';
        codeTitle = 'Outros Artigos';
      }
      
      if (!articlesByCode[codeId]) {
        articlesByCode[codeId] = [];
      }
      
      articlesByCode[codeId].push(article);
    });
    
    // Now categorize by type
    Object.entries(articlesByCode).forEach(([codeId, articles]) => {
      if (articles.length === 0) return;
      
      const category = categorizeLegalCode(codeId);
      result[category][codeId] = articles;
    });
    
    return result;
  }, [favoritedArticles]);
  
  // Fetch favorited articles from both static and Supabase data
  const fetchFavoritedArticles = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // 1. Collect articles from static data
      const staticArticles = legalCodes.flatMap(code => code.articles)
        .filter(article => favorites.includes(normalizeId(article.id)))
        .map(article => ensureExtendedArticle({
          ...article,
          artigo: article.content || '', // Map content to artigo for ExtendedArticle
        }));
      
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

  // Get code title by ID
  const getCodeTitle = (codeId: string) => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : codeId;
  };

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

  // Render categories as tabs
  const renderCategoryTabs = () => (
    <Tabs 
      defaultValue="códigos" 
      className="w-full"
      value={selectedCategory}
      onValueChange={(value) => setSelectedCategory(value as any)}
    >
      <TabsList className="grid grid-cols-4 mb-4 w-full">
        <TabsTrigger value="códigos" className="text-xs md:text-sm">Códigos</TabsTrigger>
        <TabsTrigger value="estatutos" className="text-xs md:text-sm">Estatutos</TabsTrigger>
        <TabsTrigger value="constituição" className="text-xs md:text-sm">Constituição</TabsTrigger>
        <TabsTrigger value="leis" className="text-xs md:text-sm">Leis</TabsTrigger>
      </TabsList>
      
      {['códigos', 'estatutos', 'constituição', 'leis'].map((category) => (
        <TabsContent 
          key={category} 
          value={category}
          className="animate-fade-in"
        >
          {renderCategoryContent(category as keyof CategorizedArticles)}
        </TabsContent>
      ))}
    </Tabs>
  );

  // Render codes within a category
  const renderCategoryContent = (category: keyof CategorizedArticles) => {
    const codesInCategory = Object.keys(categorizedArticles[category]);
    
    if (codesInCategory.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          Nenhum favorito nesta categoria.
        </div>
      );
    }
    
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {codesInCategory.map(codeId => {
          const articles = categorizedArticles[category][codeId];
          
          return (
            <motion.div 
              key={codeId} 
              variants={item}
              className="mb-8 bg-netflix-dark/50 p-6 rounded-lg border border-gray-800/50 shadow-lg"
            >
              <h3 className="flex items-center gap-2 text-xl font-serif font-semibold text-netflix-red mb-4 pb-2 border-b border-gray-800/50">
                {getLegalCodeIcon(codeId)}
                {getCodeTitle(codeId)}
                <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300">
                  {articles.length} {articles.length === 1 ? 'artigo' : 'artigos'}
                </span>
              </h3>
              <div className="space-y-6">
                {articles.map(article => {
                  // Adapt the ExtendedArticle for ArticleView component
                  const adaptedArticle: any = {
                    ...article,
                    content: article.artigo, // Map artigo to content for ArticleView
                  };
                  return (
                    <ArticleView key={article.id?.toString()} article={adaptedArticle} />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const paddingClass = isMobile ? "pb-24" : "pb-6";

  return (
    <div className="min-h-screen flex flex-col bg-netflix-bg animate-fade-in">
      <Header />
      
      <main className={`flex-1 container py-6 ${paddingClass}`}>
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
          renderCategoryTabs()
        )}
      </main>
    </div>
  );
};

export default Favoritos;
