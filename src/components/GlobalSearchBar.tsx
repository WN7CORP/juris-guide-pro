
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, FileText, Scale, Gavel, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { searchAllLegalCodes, LegalArticle } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { legalCodes } from "@/data/legalCodes";
import { cn } from "@/lib/utils";

interface SearchResult {
  codeId: string;
  codeTitle: string;
  article: LegalArticle;
}

const placeholderTexts = [
  "Busque por 'direitos fundamentais'...",
  "Encontre artigos sobre 'contratos'...",
  "Pesquise 'direito penal'...",
  "Procure por 'constituição'...",
  "Digite 'direito civil'..."
];

export const GlobalSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect for placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length >= 2) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (term: string) => {
    setSearching(true);
    try {
      const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
      const results = await searchAllLegalCodes(term, tableNames, {
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
              article
            });
          });
        }
      });

      setSearchResults(formattedResults.slice(0, 6)); // Limit to 6 results
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(`/codigos/${result.codeId}?article=${result.article.id}`);
    setShowResults(false);
    setSearchTerm("");
  };

  const getCodeIcon = (codeId: string) => {
    const code = legalCodes.find(c => c.id === codeId);
    if (code?.category === 'código') return Scale;
    if (code?.category === 'estatuto') return Gavel;
    return FileText;
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-law-accent/30 text-law-accent font-medium">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-law-accent animate-spin" />
          )}
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholderTexts[placeholderIndex]}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsTyping(true);
            }}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            className="pl-12 pr-12 h-14 text-lg bg-background-dark/80 backdrop-blur-sm border-gray-700 focus:border-law-accent focus:ring-law-accent/20 rounded-xl shadow-lg transition-all duration-300"
          />
        </div>

        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-background-dark/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
            >
              <div className="p-2">
                <div className="text-xs text-gray-400 px-3 py-2 border-b border-gray-700">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((result, index) => {
                  const IconComponent = getCodeIcon(result.codeId);
                  return (
                    <motion.button
                      key={`${result.codeId}-${result.article.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 hover:bg-law-accent/10 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <IconComponent className="h-4 w-4 text-law-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-law-accent font-medium mb-1">
                            {result.codeTitle}
                          </div>
                          <div className="text-sm font-medium text-white mb-1">
                            {highlightMatch(result.article.numero || 'Artigo', searchTerm)}
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-2">
                            {highlightMatch(result.article.artigo?.slice(0, 150) || '', searchTerm)}...
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-law-accent transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                    </motion.button>
                  );
                })}
                {searchResults.length >= 6 && (
                  <div className="p-3 text-center border-t border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate(`/pesquisar?q=${encodeURIComponent(searchTerm)}`);
                        setShowResults(false);
                      }}
                      className="text-law-accent hover:text-law-accent/80"
                    >
                      Ver todos os resultados
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GlobalSearchBar;
