
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, Volume2, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchHistory } from "@/components/search/SearchHistory";
import { searchAllLegalCodes } from "@/services/legalCodeService";
import { LegalArticle } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { legalCodes } from "@/data/legalCodes";
import { Link } from "react-router-dom";

interface SearchResult {
  codeId: string;
  codeTitle: string;
  article: LegalArticle;
  tableName: string;
}

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

const Pesquisar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    category: "",
    area: "",
    hasAudio: false
  });

  // Immediate search for numbers, reduced debounce for text
  const getDebounceDelay = (term: string) => {
    const trimmed = term.trim();
    if (/^\d+$/.test(trimmed)) {
      return 0;
    }
    return 100;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, getDebounceDelay(searchTerm));

  useEffect(() => {
    const performSearch = async () => {
      // Accept single character searches
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
        const results = await searchAllLegalCodes(debouncedSearchTerm, tableNames, {
          searchContent: true,
          searchExplanations: true,
          searchExamples: true
        });

        const formattedResults: SearchResult[] = [];
        results.forEach(result => {
          const codeInfo = Object.entries(tableNameMap)
            .find(([id, name]) => name === result.codeId);
          
          if (codeInfo) {
            const [codeId] = codeInfo;
            const codeTitle = legalCodes.find(code => code.id === codeId)?.title || codeId;
            
            result.articles.forEach(article => {
              if (filters.hasAudio && !article.comentario_audio) return;
              
              formattedResults.push({
                codeId,
                codeTitle,
                article,
                tableName: result.codeId
              });
            });
          }
        });

        setSearchResults(formattedResults);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, filters]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchFromHistory = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setSearchParams({ q: term });
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const filteredResults = searchResults.filter(result => {
    if (filters.category && !result.codeTitle.toLowerCase().includes(filters.category.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container pt-4 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-law-accent/20 to-blue-500/20 border border-law-accent/40">
              <Search className="h-8 w-8 text-law-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-netflix-red">
                Pesquisa Avançada
              </h1>
              <p className="text-gray-400 mt-1">
                Busque artigos em toda a legislação brasileira
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Input */}
            <Card className="bg-netflix-dark border-gray-700">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Digite qualquer termo, número de artigo (ex: 5, 157) ou palavra-chave..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 pr-12 py-4 bg-netflix-bg border-gray-600 text-white placeholder-gray-400 text-lg"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-law-accent animate-spin" />
                  )}
                </div>
                
                {searchTerm && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {isSearching ? (
                        "Buscando..."
                      ) : (
                        `${filteredResults.length} ${filteredResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
                      )}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-gray-400 border-gray-600 hover:bg-gray-700"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {showFilters && (
              <SearchFilters
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                filters={filters}
                onFiltersChange={setFilters}
              />
            )}

            {/* Results */}
            <div className="space-y-4">
              {isSearching ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 text-law-accent animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Buscando artigos...</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {filteredResults.map((result, index) => (
                    <motion.div
                      key={`${result.tableName}-${result.article.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-netflix-dark border-gray-700 hover:border-law-accent/50 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-law-accent" />
                              <div>
                                <Badge variant="outline" className="text-law-accent border-law-accent/30">
                                  Art. {result.article.numero}
                                </Badge>
                                <Badge className="ml-2 bg-netflix-red/20 text-netflix-red border-netflix-red/30">
                                  {result.codeTitle}
                                </Badge>
                              </div>
                            </div>
                            {result.article.comentario_audio && (
                              <Volume2 className="h-4 w-4 text-cyan-400" />
                            )}
                          </div>
                          
                          <p className="text-gray-300 leading-relaxed mb-4 line-clamp-3">
                            {result.article.artigo}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {result.article.comentario_audio && (
                                <span className="flex items-center gap-1 text-cyan-400">
                                  <Volume2 className="h-3 w-3" />
                                  Comentário disponível
                                </span>
                              )}
                            </div>
                            <Link
                              to={`/codigos/${result.codeId}?article=${result.article.id}&highlight=true&scroll=center&search=true`}
                              className="text-law-accent hover:text-law-accent/80 text-sm font-medium"
                            >
                              Ver artigo →
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : searchTerm && !isSearching ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <div className="p-4 rounded-full bg-gray-800/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Tente termos mais genéricos ou apenas o número do artigo
                  </p>
                </motion.div>
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SearchHistory
              onSelect={handleSearchFromHistory}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pesquisar;
