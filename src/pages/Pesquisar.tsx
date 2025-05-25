import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen, Filter } from "lucide-react";
import { tableNameMap, getUrlIdFromTableName } from "@/utils/tableMapping";
import { searchAllLegalCodes } from "@/services/legalCodeService";
import { LegalArticle } from "@/services/legalCodeService";
import CodePagination from "@/components/legal/CodePagination";
import { usePagination } from "@/hooks/usePagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { SearchHistory } from "@/components/search/SearchHistory";
import { SearchFilters } from "@/components/search/SearchFilters";
import { saveSearchHistory, categorizeLegalCode } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface SearchResult {
  codeId: string;
  codeTitle: string;
  article: LegalArticle;
  category: string;
}

const Pesquisar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [filters, setFilters] = useState({
    category: 'all',
    area: 'all',
    hasAudio: false
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isMobile = useIsMobile();
  
  const {
    currentPage,
    totalPages,
    paginatedItems,
    setPage,
    itemsPerPage
  } = usePagination<SearchResult>({
    items: searchResults,
    itemsPerPage: isMobile ? 8 : 12,
    initialPage: 1
  });

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);

      try {
        const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
        const results = await searchAllLegalCodes(debouncedSearchTerm, tableNames, {
          searchContent: true,
          searchExplanations: true,
          searchExamples: true
        });
        
        let formattedResults: SearchResult[] = [];
        
        results.forEach(result => {
          const codeInfo = Object.entries(tableNameMap)
            .find(([id, name]) => name === result.codeId);
          
          if (codeInfo) {
            const [codeId] = codeInfo;
            const codeTitle = legalCodes.find(code => code.id === codeId)?.title || codeId;
            const category = categorizeLegalCode(codeId);
            
            result.articles.forEach(article => {
              formattedResults.push({
                codeId,
                codeTitle,
                article,
                category
              });
            });
          }
        });

        // Apply filters
        if (filters.category !== 'all') {
          formattedResults = formattedResults.filter(result => result.category === filters.category);
        }

        if (filters.hasAudio) {
          formattedResults = formattedResults.filter(result => result.article.comentario_audio);
        }

        setSearchResults(formattedResults);
        
        // Save to search history
        saveSearchHistory(debouncedSearchTerm, formattedResults.length);
        
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, filters]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSelect = (term: string) => {
    setSearchTerm(term);
    setRefreshHistory(prev => prev + 1);
  };

  const handleArticleClick = (result: SearchResult) => {
    console.log("=== DEBUG: Navegando para artigo da pesquisa ===");
    console.log("result completo:", result);
    console.log("result.codeId:", result.codeId);
    console.log("result.article:", result.article);
    console.log("result.article.id:", result.article.id);
    
    try {
      // Validar dados básicos
      if (!result.codeId) {
        console.error("❌ Erro: codeId não encontrado no resultado");
        toast.error("Erro: Código não identificado.");
        return;
      }
      
      if (!result.article || !result.article.id) {
        console.error("❌ Erro: Artigo ou ID do artigo não encontrado");
        toast.error("Erro: Artigo não identificado.");
        return;
      }
      
      console.log("✅ Dados básicos validados");
      
      // Buscar URL ID usando o codeId
      const urlId = getUrlIdFromTableName(result.codeId);
      console.log("URL ID mapeado:", urlId);
      
      if (!urlId) {
        console.error("❌ Erro: Não foi possível mapear para URL ID");
        console.log("result.codeId que falhou:", result.codeId);
        console.log("Mapeamentos disponíveis:", Object.entries(tableNameMap));
        toast.error("Erro ao localizar o código. Tente novamente.");
        return;
      }
      
      console.log("✅ URL ID encontrado:", urlId);
      
      // Construir URL de navegação
      const targetUrl = `/codigos/${urlId}?article=${result.article.id}&highlight=true&scroll=center&search=true&fromSearch=true`;
      console.log("🚀 URL de destino:", targetUrl);
      
      // Adicionar aos códigos recentes
      try {
        const recentCodes = JSON.parse(localStorage.getItem('recentCodes') || '[]');
        const updatedRecent = [urlId, ...recentCodes.filter((id: string) => id !== urlId)].slice(0, 10);
        localStorage.setItem('recentCodes', JSON.stringify(updatedRecent));
        console.log("✅ Código adicionado aos recentes");
      } catch (storageError) {
        console.warn("⚠️ Erro ao salvar código recente:", storageError);
      }
      
      // Executar navegação
      console.log("🔄 Iniciando navegação...");
      navigate(targetUrl);
      console.log("✅ Navegação executada");
      
    } catch (error) {
      console.error("❌ Erro geral ao navegar:", error);
      toast.error("Erro inesperado ao navegar para o artigo.");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      códigos: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
      estatutos: 'bg-amber-900/20 border-amber-500/30 text-amber-400',
      constituição: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400',
      leis: 'bg-green-900/20 border-green-500/30 text-green-400'
    };
    return colors[category as keyof typeof colors] || colors.leis;
  };

  const showResults = searchTerm.length >= 2;
  const showHistory = !showResults && !searching;

  return (
    <div className="min-h-screen flex flex-col bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
            <Search className="h-8 w-8 text-law-accent" />
            Pesquisar
          </h1>
          <p className="text-gray-400">
            Encontre artigos em todos os códigos, leis e estatutos
          </p>
        </motion.div>
        
        {/* Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Digite termos como 'direitos fundamentais', 'contrato', etc."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="pl-10 pr-4 py-3 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-law-accent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Search is already triggered by useEffect
                  }
                }}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {isMobile ? "" : "Filtros"}
            </Button>
          </div>
          
          {/* Search Validation Message */}
          {searchTerm && !searching && searchTerm.length < 2 && (
            <p className="text-xs text-amber-500 ml-1">
              Digite pelo menos 2 caracteres para iniciar a busca
            </p>
          )}

          {/* Filters */}
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {showHistory && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SearchHistory
                onSearchSelect={handleSearchSelect}
                onClearHistory={() => setRefreshHistory(prev => prev + 1)}
              />
            </motion.div>
          )}

          {searching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <Loader2 className="h-8 w-8 animate-spin text-law-accent mr-3" />
              <span className="text-gray-300">Buscando artigos...</span>
            </motion.div>
          )}

          {showResults && !searching && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {paginatedItems.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">
                      {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para "{debouncedSearchTerm}"
                    </p>
                    
                    {/* Active Filters */}
                    {(filters.category !== 'all' || filters.hasAudio) && (
                      <div className="flex gap-2">
                        {filters.category !== 'all' && (
                          <Badge variant="secondary" className="text-xs">
                            {filters.category}
                          </Badge>
                        )}
                        {filters.hasAudio && (
                          <Badge variant="secondary" className="text-xs">
                            Com áudio
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedItems.map((result, index) => (
                      <motion.div
                        key={`${result.codeId}-${result.article.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="bg-netflix-dark border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer h-full"
                          onClick={() => handleArticleClick(result)}
                        >
                          <CardContent className="p-4 h-full flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="h-4 w-4 text-law-accent" />
                                  <span className="text-xs font-medium text-law-accent">
                                    {result.codeTitle}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-white mb-1">
                                  {result.article.numero}
                                </h3>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getCategoryColor(result.category)} border`}
                                >
                                  {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                                </Badge>
                                
                                {result.article.comentario_audio && (
                                  <Badge variant="secondary" className="text-xs">
                                    🔊 Áudio
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 line-clamp-3 flex-1">
                              {result.article.artigo}
                            </p>
                            
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <span className="text-xs text-law-accent hover:underline">
                                Clique para ver o artigo completo →
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  {searchResults.length > itemsPerPage && (
                    <CodePagination
                      totalItems={searchResults.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={setPage}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-netflix-dark p-8 rounded-lg text-center border border-gray-700">
                  <Search className="h-16 w-16 mx-auto text-gray-500 mb-4 opacity-50" />
                  <h3 className="text-xl text-gray-300 mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Não encontramos artigos para "{debouncedSearchTerm}"
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Dicas para uma busca melhor:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Verifique a ortografia dos termos</li>
                      <li>Use palavras-chave mais genéricas</li>
                      <li>Tente buscar apenas uma palavra por vez</li>
                      <li>Remova os filtros ativos</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Pesquisar;
