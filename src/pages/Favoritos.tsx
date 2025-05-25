
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "@/store/favoritesStore";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { BookMarked, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KNOWN_TABLES, getUrlIdFromTableName } from "@/utils/tableMapping";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { categorizeLegalCode } from "@/utils/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FavoriteCard } from "@/components/favorites/FavoriteCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExtendedArticle {
  id: string | number;
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario_audio?: string;
  codeId?: string;
  dateAdded?: string;
}

interface CategorizedArticles {
  códigos: ExtendedArticle[];
  estatutos: ExtendedArticle[];
  constituição: ExtendedArticle[];
  leis: ExtendedArticle[];
}

const Favoritos = () => {
  const navigate = useNavigate();
  const { favorites, normalizeId } = useFavoritesStore();
  const [favoritedArticles, setFavoritedArticles] = useState<ExtendedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical" | "code">("recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const isMobile = useIsMobile();

  // Categorize and filter articles
  const categorizedArticles = useMemo(() => {
    const result: CategorizedArticles = {
      códigos: [],
      estatutos: [],
      constituição: [],
      leis: []
    };

    const filtered = favoritedArticles.filter(article => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          article.artigo?.toLowerCase().includes(searchLower) ||
          article.numero?.toLowerCase().includes(searchLower) ||
          article.codeId?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      return true;
    });

    // Sort articles
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "alphabetical":
          comparison = (a.numero || '').localeCompare(b.numero || '');
          break;
        case "code":
          comparison = (a.codeId || '').localeCompare(b.codeId || '');
          break;
        case "recent":
        default:
          comparison = new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Categorize articles
    sorted.forEach(article => {
      const category = categorizeLegalCode(article.codeId || '');
      result[category].push(article);
    });

    return result;
  }, [favoritedArticles, searchTerm, sortBy, sortOrder]);

  // Get all articles for selected category or all
  const displayArticles = useMemo(() => {
    if (selectedCategory === "all") {
      return [
        ...categorizedArticles.códigos,
        ...categorizedArticles.estatutos,
        ...categorizedArticles.constituição,
        ...categorizedArticles.leis
      ];
    }
    return categorizedArticles[selectedCategory as keyof CategorizedArticles] || [];
  }, [categorizedArticles, selectedCategory]);

  // Fetch favorited articles
  const fetchFavoritedArticles = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const staticArticles = legalCodes.flatMap(code => 
        code.articles
          .filter(article => favorites.includes(normalizeId(article.id)))
          .map(article => ({
            ...article,
            artigo: article.content || '',
            codeId: code.id,
            dateAdded: new Date().toISOString() // Default date
          }))
      );
      
      const supabaseArticles: ExtendedArticle[] = [];
      const numericFavoriteIds = favorites
        .filter(id => !isNaN(Number(id)))
        .map(id => Number(id));
      
      if (numericFavoriteIds.length > 0) {
        const batchSize = 10;
        
        for (let i = 0; i < KNOWN_TABLES.length; i += batchSize) {
          const batchTables = KNOWN_TABLES.slice(i, i + batchSize);
          
          const batchPromises = batchTables.map(async (tableName) => {
            try {
              if (!tableName) return [];
              
              const { data, error } = await supabase
                .from(tableName as any)
                .select('*')
                .in('id', numericFavoriteIds);
              
              if (error) {
                console.error(`Error querying table ${tableName}:`, error);
                return [];
              }
              
              // Add proper type checking for the data
              if (data && Array.isArray(data) && data.length > 0) {
                return data.map((item: any) => ({
                  id: item?.id?.toString() || '',
                  numero: item?.numero || '',
                  artigo: item?.artigo || '',
                  tecnica: item?.tecnica,
                  formal: item?.formal,
                  exemplo: item?.exemplo,
                  comentario_audio: item?.comentario_audio,
                  codeId: tableName,
                  dateAdded: new Date().toISOString()
                }));
              }
              
              return [];
            } catch (err) {
              console.error(`Error fetching from table ${tableName}:`, err);
              return [];
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          
          batchResults.forEach(articles => {
            if (Array.isArray(articles) && articles.length > 0) {
              supabaseArticles.push(...articles);
            }
          });
        }
      }
      
      const allArticles = [...staticArticles, ...supabaseArticles];
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

  const getCodeTitle = (codeId: string) => {
    const code = legalCodes.find(c => 
      c.id === codeId || 
      c.id.toLowerCase().includes(codeId.toLowerCase()) ||
      codeId.toLowerCase().includes(c.id.toLowerCase())
    );
    return code ? code.title : codeId.toUpperCase().replace(/_/g, ' ');
  };

  const handleNavigateToArticle = (article: ExtendedArticle) => {
    const urlId = getUrlIdFromTableName(article.codeId || '');
    
    if (!urlId) {
      console.error("Não foi possível encontrar URL ID para a tabela:", article.codeId);
      toast.error("Erro ao navegar para o artigo");
      return;
    }
    
    // Add to recent codes
    const recentCodes = JSON.parse(localStorage.getItem('recentCodes') || '[]');
    const updatedRecent = [urlId, ...recentCodes.filter((id: string) => id !== urlId)].slice(0, 10);
    localStorage.setItem('recentCodes', JSON.stringify(updatedRecent));
    
    // Navigate with enhanced parameters
    navigate(`/codigos/${urlId}?article=${article.id}&highlight=true&scroll=center&fromFavorites=true`);
  };

  const getCategoryStats = () => {
    return {
      total: displayArticles.length,
      códigos: categorizedArticles.códigos.length,
      estatutos: categorizedArticles.estatutos.length,
      constituição: categorizedArticles.constituição.length,
      leis: categorizedArticles.leis.length
    };
  };

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen flex flex-col bg-netflix-bg">
      <Header />
      
      <main className={`flex-1 container py-6 ${isMobile ? 'px-4' : 'px-6'} max-w-7xl mx-auto`}>
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                <BookMarked className="h-8 w-8 text-law-accent" />
                Meus Favoritos
              </h1>
              <p className="text-gray-400">
                {stats.total} {stats.total === 1 ? 'artigo favoritado' : 'artigos favoritados'}
              </p>
            </div>
            
            {/* Category Stats */}
            <div className="hidden md:flex gap-2">
              <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                Códigos: {stats.códigos}
              </Badge>
              <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                Estatutos: {stats.estatutos}
              </Badge>
              <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                Constituição: {stats.constituição}
              </Badge>
              <Badge variant="outline" className="text-green-400 border-green-500/30">
                Leis: {stats.leis}
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar nos favoritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-600"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="códigos">Códigos ({stats.códigos})</SelectItem>
                  <SelectItem value="estatutos">Estatutos ({stats.estatutos})</SelectItem>
                  <SelectItem value="constituição">Constituição ({stats.constituição})</SelectItem>
                  <SelectItem value="leis">Leis ({stats.leis})</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40 bg-gray-900 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="alphabetical">Alfabética</SelectItem>
                    <SelectItem value="code">Por código</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-400">Carregando favoritos...</div>
          </div>
        ) : displayArticles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-gray-800/30 rounded-lg border border-gray-700 p-12 text-center"
          >
            <BookMarked className="h-16 w-16 mx-auto text-gray-500 mb-4 opacity-50" />
            <h3 className="text-xl text-gray-300 mb-4">
              {searchTerm || selectedCategory !== "all" 
                ? "Nenhum favorito encontrado" 
                : "Você ainda não adicionou artigos aos favoritos"
              }
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Navegue pelos códigos e utilize o ícone de favorito para salvar artigos para consulta rápida"
              }
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {displayArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FavoriteCard
                    article={article}
                    codeTitle={getCodeTitle(article.codeId || '')}
                    codeId={article.codeId || ''}
                    category={categorizeLegalCode(article.codeId || '')}
                    onNavigate={() => handleNavigateToArticle(article)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Favoritos;
