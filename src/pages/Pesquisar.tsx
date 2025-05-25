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

// Function to parse search terms for specific codes and articles
const parseSearchTerm = (searchTerm: string) => {
  const lowerTerm = searchTerm.toLowerCase().trim();
  
  // Check for patterns like "art 157 do código penal", "artigo 5 constituição", etc.
  const patterns = [
    /(?:art(?:igo)?\.?\s+)?(\d+).*?(?:código penal|cp)/i,
    /(?:art(?:igo)?\.?\s+)?(\d+).*?(?:constituição|cf|federal)/i,
    /(?:art(?:igo)?\.?\s+)?(\d+).*?(?:código civil|cc)/i,
    /(?:art(?:igo)?\.?\s+)?(\d+).*?(?:código\s+de\s+processo\s+penal|cpp)/i,
    /(?:art(?:igo)?\.?\s+)?(\d+).*?(?:código\s+de\s+processo\s+civil|cpc)/i,
    /(?:art(?:igo)?\.?\s+)?(\d+).*?(?:clt|consolidação)/i,
  ];

  const codeMapping = {
    'código penal': 'codigo-penal',
    'cp': 'codigo-penal',
    'constituição': 'constituicao-federal',
    'cf': 'constituição-federal',
    'federal': 'constituição-federal',
    'código civil': 'codigo-civil',
    'cc': 'código-civil',
    'código de processo penal': 'codigo-processo-penal',
    'cpp': 'codigo-processo-penal',
    'código de processo civil': 'codigo-processo-civil',
    'cpc': 'codigo-processo-civil',
    'clt': 'clt',
    'consolidação': 'clt'
  };

  for (const pattern of patterns) {
    const match = lowerTerm.match(pattern);
    if (match) {
      const articleNumber = match[1];
      let codeId = null;
      
      // Find the code based on the matched text
      for (const [keyword, id] of Object.entries(codeMapping)) {
        if (lowerTerm.includes(keyword)) {
          codeId = id;
          break;
        }
      }
      
      if (codeId) {
        return { articleNumber, codeId, isSpecificCodeSearch: true };
      }
    }
  }
  
  return { searchTerm: lowerTerm, isSpecificCodeSearch: false };
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
  const debouncedSearchTerm = useDebounce(searchTerm, 200); // Reduced from 500ms to 200ms
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
      // UPDATED: Accept search with 1 character
      if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 1) {
        setSearchResults([]);
        return;
      }

      setSearching(true);

      try {
        const parsedSearch = parseSearchTerm(debouncedSearchTerm);
        
        if (parsedSearch.isSpecificCodeSearch && parsedSearch.codeId && parsedSearch.articleNumber) {
          // Direct navigation for specific code searches
          console.log("Navegação direta para:", parsedSearch.codeId, "artigo:", parsedSearch.articleNumber);
          navigate(`/codigos/${parsedSearch.codeId}?article=${parsedSearch.articleNumber}&highlight=true&scroll=center&search=true`);
          return;
        }

        const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
        
        // UPDATED: Always search all fields for any term
        const isJustNumber = /^\d+$/.test(debouncedSearchTerm.trim());
        
        const results = await searchAllLegalCodes(debouncedSearchTerm, tableNames, {
          searchContent: true, // Always search content
          searchExplanations: true, // Always search explanations
          searchExamples: true // Always search examples
        });

        const formattedResults: SearchResult[] = [];
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
        let filteredResults = formattedResults;
        
        if (filters.category !== 'all') {
          filteredResults = filteredResults.filter(result => result.category === filters.category);
        }
        
        if (filters.hasAudio) {
          filteredResults = filteredResults.filter(result => result.article.comentario_audio);
        }

        setSearchResults(filteredResults);
        
        // Save to search history if significant search
        if (debouncedSearchTerm.length > 2) {
          saveSearchHistory(debouncedSearchTerm, filteredResults.length);
        }
        
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Erro ao realizar a busca');
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, filters, navigate]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSelect = (term: string) => {
    setSearchTerm(term);
    setRefreshHistory(prev => prev + 1);
  };

  const handleArticleClick = (result: SearchResult) => {
    const urlId = getUrlIdFromTableName(result.codeId);
    if (urlId) {
      navigate(`/codigos/${urlId}?article=${result.article.id}&highlight=true&scroll=center&search=true`);
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

  const showResults = searchTerm.length >= 1;
  const showHistory = !showResults && !searching;

  return (
    <div className="min-h-screen flex flex-col bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
            <Search className="h-8 w-8 text-law-accent" />
            Pesquisa Global
          </h1>
          <p className="text-gray-400">
            Busque em todos os códigos, estatutos e leis simultaneamente
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Digite o número do artigo (ex: 5) ou busque por conteúdo..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="pl-12 pr-4 py-4 text-lg bg-gray-800 border-gray-600 focus:border-law-accent"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-5 w-5 text-law-accent animate-spin" />
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Filters */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full mb-4 lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                
                <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                  <SearchFilters filters={filters} onFiltersChange={setFilters} />
                </div>
              </motion.div>

              {/* Search History */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 }}
              >
                <SearchHistory 
                  onSelect={handleSearchSelect} 
                  refreshTrigger={refreshHistory}
                />
              </motion.div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {searching ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center justify-center py-12"
              >
                <Loader2 className="h-8 w-8 text-law-accent animate-spin mr-3" />
                <span className="text-gray-200 text-lg">Buscando em todos os códigos...</span>
              </motion.div>
            ) : searchResults.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.2 }}
              >
                {/* Results count */}
                <div className="mb-6">
                  <p className="text-gray-300">
                    Encontrados <span className="text-law-accent font-semibold">{searchResults.length}</span> resultados
                    {searchTerm && ` para "${searchTerm}"`}
                  </p>
                </div>

                {/* Results grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <AnimatePresence>
                    {paginatedItems.map((result, index) => (
                      <motion.div
                        key={`${result.codeId}-${result.article.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card 
                          className="h-full bg-gray-800 border-gray-700 hover:border-law-accent/50 transition-all duration-300 cursor-pointer"
                          onClick={() => handleArticleClick(result)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-law-accent" />
                                <Badge variant="outline" className="text-law-accent border-law-accent/30">
                                  Art. {result.article.numero}
                                </Badge>
                              </div>
                              {result.article.comentario_audio && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Áudio
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="text-sm font-medium text-gray-300 mb-2">
                              {result.codeTitle}
                            </h3>
                            
                            <p className="text-gray-100 text-sm leading-relaxed line-clamp-4">
                              {result.article.artigo}
                            </p>
                            
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <Badge variant="secondary" className="text-xs">
                                {result.category}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <CodePagination
                    totalItems={searchResults.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setPage}
                  />
                )}
              </motion.div>
            ) : searchTerm ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-12"
              >
                <BookOpen className="h-16 w-16 mx-auto text-gray-500 mb-4 opacity-50" />
                <h3 className="text-xl text-gray-300 mb-4">Nenhum resultado encontrado</h3>
                <p className="text-gray-400 mb-6">
                  Não foi possível encontrar artigos para "{searchTerm}"
                </p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-12"
              >
                <Search className="h-16 w-16 mx-auto text-gray-500 mb-4 opacity-50" />
                <h3 className="text-xl text-gray-300 mb-4">Comece sua pesquisa</h3>
                <p className="text-gray-400">
                  Digite um termo de busca ou número de artigo para pesquisar em todos os códigos
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pesquisar;
