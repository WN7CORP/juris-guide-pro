
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
  codeId?: string; // Add codeId to track which legal code this belongs to
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
    codeId,
  };
};

// Helper function to ensure type compatibility
const ensureExtendedArticle = (article: BaseArticle, codeId?: string): ExtendedArticle => {
  return {
    ...article,
    artigo: article.artigo || article.content || '',
    codeId,
  };
};

// Helper function to extract code ID from article ID
const extractCodeIdFromArticle = (articleId: string): string => {
  if (typeof articleId === 'string' && articleId.includes('-')) {
    const parts = articleId.split('-');
    return parts[0];
  }
  return 'outros';
};

const Favoritos = () => {
  const { favorites, normalizeId } = useFavoritesStore();
  const [favoritedArticles, setFavoritedArticles] = useState<ExtendedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'códigos' | 'estatutos' | 'constituição' | 'leis'>('códigos');
  const isMobile = useIsMobile();
  
  // Categorize articles by code type with improved logic
  const categorizedArticles = useMemo(() => {
    const result: CategorizedArticles = {
      códigos: {},
      estatutos: {},
      constituição: {},
      leis: {}
    };
    
    // Group articles by their code with better categorization
    const articlesByCode: Record<string, ExtendedArticle[]> = {};
    
    favoritedArticles.forEach(article => {
      let codeId = article.codeId || extractCodeIdFromArticle(article.id.toString());
      
      if (!articlesByCode[codeId]) {
        articlesByCode[codeId] = [];
      }
      
      articlesByCode[codeId].push(article);
    });
    
    // Now categorize by type with improved mapping
    Object.entries(articlesByCode).forEach(([codeId, articles]) => {
      if (articles.length === 0) return;
      
      const category = categorizeLegalCode(codeId);
      
      // Find the matching legal code for better title display
      const matchingCode = legalCodes.find(c => 
        c.id === codeId || 
        c.id.toLowerCase().includes(codeId.toLowerCase()) ||
        codeId.toLowerCase().includes(c.id.toLowerCase())
      );
      
      const displayCodeId = matchingCode ? matchingCode.id : codeId;
      result[category][displayCodeId] = articles;
    });
    
    return result;
  }, [favoritedArticles]);
  
  // Fetch favorited articles from both static and Supabase data
  const fetchFavoritedArticles = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // 1. Collect articles from static data
      const staticArticles = legalCodes.flatMap(code => 
        code.articles
          .filter(article => favorites.includes(normalizeId(article.id)))
          .map(article => ensureExtendedArticle({
            ...article,
            artigo: article.content || '',
          }, code.id))
      );
      
      // 2. Fetch articles from Supabase that match favorited IDs
      const supabaseArticles: ExtendedArticle[] = [];
      
      // Get numeric favorite IDs to search for in Supabase tables
      const numericFavoriteIds = favorites
        .filter(id => !isNaN(Number(id)))
        .map(id => Number(id));
      
      // If we have numeric favorite IDs, query each known table
      if (numericFavoriteIds.length > 0) {
        const batchSize = 10;
        
        for (let i = 0; i < KNOWN_TABLES.length; i += batchSize) {
          const batchTables = KNOWN_TABLES.slice(i, i + batchSize);
          
          const batchPromises = batchTables.map(async (tableName) => {
            try {
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
          
          const batchResults = await Promise.all(batchPromises);
          
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

  // Get code title by ID with improved matching
  const getCodeTitle = (codeId: string) => {
    const code = legalCodes.find(c => 
      c.id === codeId || 
      c.id.toLowerCase().includes(codeId.toLowerCase()) ||
      codeId.toLowerCase().includes(c.id.toLowerCase())
    );
    return code ? code.title : codeId.toUpperCase().replace(/_/g, ' ');
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

  // Get total count for each category
  const getCategoryCount = (category: keyof CategorizedArticles) => {
    return Object.values(categorizedArticles[category]).reduce((total, articles) => total + articles.length, 0);
  };

  // Render categories as tabs with counts
  const renderCategoryTabs = () => (
    <Tabs 
      defaultValue="códigos" 
      className="w-full"
      value={selectedCategory}
      onValueChange={(value) => setSelectedCategory(value as any)}
    >
      <TabsList className="grid grid-cols-4 mb-6 w-full bg-gray-800 border border-gray-700">
        <TabsTrigger 
          value="códigos" 
          className="text-xs md:text-sm flex flex-col items-center gap-1 data-[state=active]:bg-netflix-red data-[state=active]:text-white"
        >
          <Scale className="h-4 w-4" />
          <span>Códigos</span>
          {getCategoryCount('códigos') > 0 && (
            <span className="text-xs bg-netflix-red text-white rounded-full px-1.5 py-0.5 min-w-[20px]">
              {getCategoryCount('códigos')}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="estatutos" 
          className="text-xs md:text-sm flex flex-col items-center gap-1 data-[state=active]:bg-amber-600 data-[state=active]:text-white"
        >
          <FileText className="h-4 w-4" />
          <span>Estatutos</span>
          {getCategoryCount('estatutos') > 0 && (
            <span className="text-xs bg-amber-600 text-white rounded-full px-1.5 py-0.5 min-w-[20px]">
              {getCategoryCount('estatutos')}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="constituição" 
          className="text-xs md:text-sm flex flex-col items-center gap-1 data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
        >
          <BookOpen className="h-4 w-4" />
          <span>Constituição</span>
          {getCategoryCount('constituição') > 0 && (
            <span className="text-xs bg-yellow-600 text-white rounded-full px-1.5 py-0.5 min-w-[20px]">
              {getCategoryCount('constituição')}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="leis" 
          className="text-xs md:text-sm flex flex-col items-center gap-1 data-[state=active]:bg-green-600 data-[state=active]:text-white"
        >
          <Scale className="h-4 w-4" />
          <span>Leis</span>
          {getCategoryCount('leis') > 0 && (
            <span className="text-xs bg-green-600 text-white rounded-full px-1.5 py-0.5 min-w-[20px]">
              {getCategoryCount('leis')}
            </span>
          )}
        </TabsTrigger>
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
        <div className="text-center py-12 text-gray-400 bg-gray-800/30 rounded-lg border border-gray-700">
          <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Nenhum favorito nesta categoria</p>
          <p className="text-sm">
            {category === 'códigos' && 'Adicione artigos de códigos aos seus favoritos'}
            {category === 'estatutos' && 'Adicione artigos de estatutos aos seus favoritos'}
            {category === 'constituição' && 'Adicione artigos da constituição aos seus favoritos'}
            {category === 'leis' && 'Adicione artigos de leis aos seus favoritos'}
          </p>
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
          const categoryColor = {
            códigos: 'border-blue-500/30 bg-blue-950/20',
            estatutos: 'border-amber-500/30 bg-amber-950/20',
            constituição: 'border-yellow-500/30 bg-yellow-950/20',
            leis: 'border-green-500/30 bg-green-950/20'
          }[category];
          
          return (
            <motion.div 
              key={codeId} 
              variants={item}
              className={`mb-8 p-6 rounded-lg border ${categoryColor} shadow-lg`}
            >
              <h3 className="flex items-center gap-3 text-xl font-serif font-semibold text-netflix-red mb-4 pb-3 border-b border-gray-700">
                {getLegalCodeIcon(codeId)}
                <span className="flex-grow">{getCodeTitle(codeId)}</span>
                <span className="text-sm bg-gray-700 px-3 py-1 rounded-full text-gray-300 font-normal">
                  {articles.length} {articles.length === 1 ? 'artigo' : 'artigos'}
                </span>
              </h3>
              <div className="space-y-4">
                {articles.map(article => {
                  const adaptedArticle: any = {
                    ...article,
                    content: article.artigo,
                  };
                  return (
                    <div key={article.id?.toString()} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <ArticleView article={adaptedArticle} />
                    </div>
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
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-6"
        >
          <h2 className="text-2xl font-serif font-bold text-law-accent mb-2 flex items-center gap-2">
            <BookMarked className="h-6 w-6" />
            Artigos Favoritos
          </h2>
          <p className="text-gray-400 text-sm">
            {favorites.length} {favorites.length === 1 ? 'artigo favoritado' : 'artigos favoritados'}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-400">Carregando favoritos...</div>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-gray-800/30 rounded-lg border border-gray-700 p-8 text-center"
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
            className="bg-gray-800/30 rounded-lg border border-gray-700 p-8 text-center"
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
