
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, BookOpen, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { searchAllLegalCodes } from "@/services/legalCodeService";
import { LegalArticle } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { legalCodes } from "@/data/legalCodes";
import { Card, CardContent } from "@/components/ui/card";

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

// Enhanced function to parse search terms for specific codes and articles
const parseSearchTerm = (searchTerm: string) => {
  const lowerTerm = searchTerm.toLowerCase().trim();
  
  // Enhanced patterns for more comprehensive article search
  const patterns = [
    // "art 157 código penal", "artigo 157 cp", etc.
    /(?:art(?:igo)?\.?\s+)?(\d+(?:-[A-Z])?)\s*(?:do\s+)?(?:código\s+penal|cp)/i,
    // "art 5 constituição", "artigo 5 cf", etc.
    /(?:art(?:igo)?\.?\s+)?(\d+(?:-[A-Z])?)\s*(?:da\s+)?(?:constituição|cf|federal)/i,
    // "art 927 código civil", "artigo 927 cc", etc.
    /(?:art(?:igo)?\.?\s+)?(\d+(?:-[A-Z])?)\s*(?:do\s+)?(?:código\s+civil|cc)/i,
    // "art 155 cpp", etc.
    /(?:art(?:igo)?\.?\s+)?(\d+(?:-[A-Z])?)\s*(?:do\s+)?(?:código\s+de\s+processo\s+penal|cpp)/i,
    // "art 319 cpc", etc.
    /(?:art(?:igo)?\.?\s+)?(\d+(?:-[A-Z])?)\s*(?:do\s+)?(?:código\s+de\s+processo\s+civil|cpc)/i,
    // "art 7 clt", etc.
    /(?:art(?:igo)?\.?\s+)?(\d+(?:-[A-Z])?)\s*(?:da\s+)?(?:clt|consolidação)/i,
  ];

  const codeMapping = {
    'código penal': 'codigo-penal',
    'cp': 'codigo-penal',
    'constituição': 'constituicao-federal',
    'cf': 'constituicao-federal',
    'federal': 'constituicao-federal',
    'código civil': 'codigo-civil',
    'cc': 'codigo-civil',
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
  
  // Check for just article numbers (e.g., "157", "art 157") without specific code
  const articleOnlyPattern = /(?:art(?:igo)?\.?\s+)?(\d+(?:-[A-Z])?)\s*$/i;
  const articleMatch = lowerTerm.match(articleOnlyPattern);
  if (articleMatch) {
    return { articleNumber: articleMatch[1], isArticleSearch: true };
  }
  
  return { searchTerm: lowerTerm, isSpecificCodeSearch: false, isArticleSearch: false };
};

export const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const navigate = useNavigate();

  const placeholders = [
    "Busque por artigos em todos os códigos...",
    "Ex: art 157 do código penal, artigo 5 constituição...",
    "Pesquise na Constituição, Código Civil...",
    "Digite o número do artigo ou tema..."
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const parsedSearch = parseSearchTerm(debouncedSearchTerm);
        
        // Handle specific code and article search
        if (parsedSearch.isSpecificCodeSearch && parsedSearch.codeId && parsedSearch.articleNumber) {
          console.log("Navegação direta para:", parsedSearch.codeId, "artigo:", parsedSearch.articleNumber);
          setSearchTerm("");
          setShowResults(false);
          navigate(`/codigos/${parsedSearch.codeId}?article=${parsedSearch.articleNumber}&highlight=true&scroll=center&search=true`);
          return;
        }

        // Regular search
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
              formattedResults.push({
                codeId,
                codeTitle,
                article,
                tableName: result.codeId
              });
            });
          }
        });

        // If searching for just an article number, prioritize exact matches
        if (parsedSearch.isArticleSearch && parsedSearch.articleNumber) {
          formattedResults.sort((a, b) => {
            const aExact = a.article.numero === parsedSearch.articleNumber;
            const bExact = b.article.numero === parsedSearch.articleNumber;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return 0;
          });
        }

        setSearchResults(formattedResults.slice(0, 8));
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, navigate]);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log("Navigating to article:", result.codeId, result.article.id, result.tableName);
    
    setSearchTerm("");
    setShowResults(false);
    
    const recentCodes = JSON.parse(localStorage.getItem('recentCodes') || '[]');
    const updatedRecent = [result.codeId, ...recentCodes.filter((id: string) => id !== result.codeId)].slice(0, 10);
    localStorage.setItem('recentCodes', JSON.stringify(updatedRecent));
    
    navigate(`/codigos/${result.codeId}?article=${result.article.id}&highlight=true&scroll=center&search=true`);
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchTerm("");
      setShowResults(false);
    }
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
            isFocused ? 'text-law-accent' : 'text-gray-400'
          }`} />
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[currentPlaceholder]}
            className="w-full pl-12 pr-12 py-4 bg-netflix-dark/80 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-law-accent focus:border-law-accent transition-all duration-300 shadow-lg"
          />
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {isSearching && (
              <Loader2 className="h-4 w-4 text-law-accent animate-spin" />
            )}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setShowResults(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showResults && (searchResults.length > 0 || isSearching) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <Card className="bg-netflix-dark/95 backdrop-blur-sm border-gray-700 shadow-2xl">
                <CardContent className="p-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 text-law-accent animate-spin mr-2" />
                      <span className="text-gray-200">Buscando...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((result, index) => (
                        <motion.button
                          key={`${result.tableName}-${result.article.id}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-4 w-4 text-law-accent mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-law-accent">
                                  {result.codeTitle}
                                </span>
                                <span className="text-xs bg-law-accent/20 text-law-accent px-2 py-0.5 rounded-full">
                                  Art. {result.article.numero}
                                </span>
                              </div>
                              <p className="text-sm text-gray-100 line-clamp-2 group-hover:text-white transition-colors">
                                {result.article.artigo}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <button
                          onClick={() => navigate(`/pesquisar?q=${encodeURIComponent(searchTerm)}`)}
                          className="w-full text-center py-2 text-sm text-law-accent hover:text-law-accent/80 transition-colors"
                        >
                          Ver todos os resultados ({searchResults.length}+)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-300">
                      Nenhum resultado encontrado
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
