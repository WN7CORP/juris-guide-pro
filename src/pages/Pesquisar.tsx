import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { tableNameMap, getUrlIdFromTableName } from "@/utils/tableMapping";
import { searchAllLegalCodes } from "@/services/legalCodeService";
import { LegalArticle } from "@/services/legalCodeService";
import CodePagination from "@/components/legal/CodePagination";
import { usePagination } from "@/hooks/usePagination";
import { useIsMobile } from "@/hooks/use-mobile";

// Utility to debounce function calls
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
}

const Pesquisar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isMobile = useIsMobile();
  
  // Pagination for search results
  const {
    currentPage,
    totalPages,
    paginatedItems,
    setPage,
    itemsPerPage
  } = usePagination<SearchResult>({
    items: searchResults,
    itemsPerPage: isMobile ? 5 : 10,
    initialPage: 1
  });

  // Effect for searching when debounced search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);

      try {
        // Get all table names from tableNameMap
        const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
        
        // Search across all tables
        const results = await searchAllLegalCodes(debouncedSearchTerm, tableNames, {
          searchContent: true,
          searchExplanations: true,
          searchExamples: true
        });
        
        // Format results for display
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
        
        setSearchResults(formattedResults);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchButtonClick = () => {
    // Since we're already using useEffect with debounce, 
    // this is just a UX feature to make the button feel responsive
    setSearching(true);
  };

  const handleArticleClick = (result: SearchResult) => {
    console.log("Navegando para artigo da pesquisa:", result.codeId, result.article.id);
    
    // Convert the table name back to URL ID
    const urlId = getUrlIdFromTableName(result.codeId);
    
    if (!urlId) {
      console.error("Não foi possível encontrar URL ID para a tabela:", result.codeId);
      return;
    }
    
    console.log("URL ID encontrado:", urlId);
    console.log("Navegando para:", `/codigos/${urlId}?article=${result.article.id}&highlight=true&scroll=center&search=true&fromSearch=true`);
    
    // Add to recent codes in localStorage
    const recentCodes = JSON.parse(localStorage.getItem('recentCodes') || '[]');
    const updatedRecent = [urlId, ...recentCodes.filter((id: string) => id !== urlId)].slice(0, 10);
    localStorage.setItem('recentCodes', JSON.stringify(updatedRecent));
    
    // Navigate directly to the specific article with enhanced parameters
    // Use setTimeout to ensure smooth navigation
    setTimeout(() => {
      navigate(`/codigos/${urlId}?article=${result.article.id}&highlight=true&scroll=center&search=true&fromSearch=true`);
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <h2 className="text-2xl font-serif font-bold text-law mb-6">
          Pesquisar
        </h2>
        
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Digite termos como 'direitos fundamentais', 'contrato', etc."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="pr-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchButtonClick();
                  }
                }}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <Button onClick={handleSearchButtonClick} disabled={searching}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          
          {searchTerm && !searching && searchTerm.length < 2 && (
            <p className="text-xs text-amber-500 mt-1 ml-1">
              Digite pelo menos 2 caracteres para iniciar a busca
            </p>
          )}
        </div>
        
        {paginatedItems.length > 0 ? (
          <div>
            <p className="text-sm text-gray-300 mb-4">
              {searchResults.length} resultados encontrados para "{debouncedSearchTerm}"
            </p>
            <div className="divide-y divide-gray-800">
              {paginatedItems.map((result, index) => (
                <button
                  key={`${result.codeId}-${result.article.id}-${index}`}
                  onClick={() => handleArticleClick(result)}
                  className="w-full text-left py-4 hover:bg-gray-800/30 transition-colors rounded-lg px-2 group"
                >
                  <div className="block mb-1 text-xs font-medium text-law-accent group-hover:text-law-accent/80">
                    {result.codeTitle}
                  </div>
                  <div className="block mb-2 font-medium group-hover:underline text-netflix-red">
                    {result.article.numero}
                    {result.article.artigo && ` - ${result.article.artigo.split('\n')[0].slice(0, 50)}`}
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {result.article.artigo}
                  </p>
                  
                  {result.article.comentario_audio && (
                    <div className="mt-2">
                      <span className="text-xs bg-law-accent/20 text-law-accent px-2 py-0.5 rounded-full">
                        Comentário em áudio disponível
                      </span>
                    </div>
                  )}
                </button>
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
        ) : searching ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-law-accent" />
            <span className="ml-3 text-gray-300">Buscando artigos...</span>
          </div>
        ) : searchTerm && searchTerm.length >= 2 ? (
          <div className="bg-netflix-dark p-6 rounded-lg text-center border border-gray-800">
            <p className="text-gray-300">
              Nenhum resultado encontrado para "{debouncedSearchTerm}"
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Pesquisar;
