import { useParams, Link, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useState, useEffect, useCallback } from "react";
import { fetchLegalCode, searchAllLegalCodes, LegalArticle } from "@/services/legalCodeService";
import { toast } from "sonner";
import { FontSizeControl } from "@/components/FontSizeControl";
import { useFontSize } from "@/hooks/useFontSize";
import CodeHeader from "@/components/CodeHeader";
import CodeSearch from "@/components/CodeSearch";
import ArticlesLoading from "@/components/ArticlesLoading";
import ErrorDialog from "@/components/ErrorDialog";
import ScrollToTop from "@/components/ScrollToTop";
import ArticleView from "@/components/article/ArticleView";
import CommentedArticlesMenu from "@/components/CommentedArticlesMenu";
import { tableNameMap } from "@/utils/tableMapping";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Button } from "@/components/ui/button";
import { BookOpen, Info, Search, Loader2 } from "lucide-react";
import { preloadAudioBatch } from "@/services/audioPreloadService";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import CodePagination from "@/components/legal/CodePagination";

const ITEMS_PER_PAGE = 20; // Define número de artigos por página

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const codigo = legalCodes.find(c => c.id === codigoId);
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [searchResults, setSearchResults] = useState<LegalArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");

  // Font size hook
  const { fontSize, increaseFontSize, decreaseFontSize, minFontSize, maxFontSize } = useFontSize();

  // Função para carregar artigos paginados
  const loadArticles = useCallback(async (page = 1) => {
    if (!codigoId) return;
    try {
      setLoading(true);
      const tableName = tableNameMap[codigoId];
      if (tableName) {
        const { articles: data, total } = await fetchLegalCode(tableName, page, ITEMS_PER_PAGE);

        // Log data to help debug
        console.log(`Loaded ${data.length} articles for ${tableName} (page ${page} of ${Math.ceil(total/ITEMS_PER_PAGE)})`);
        
        setArticles(data);
        setTotalArticles(total);

        // Pre-load audio files for visible articles only
        const audioUrls = data
          .filter(article => article.comentario_audio)
          .map(article => article.comentario_audio as string);
        
        if (audioUrls.length > 0) {
          console.log(`Pre-loading ${audioUrls.length} audio files`);
          preloadAudioBatch(audioUrls);
        }

        // Update global state with code ID for proper navigation from player
        if (globalAudioState.minimalPlayerInfo) {
          globalAudioState.minimalPlayerInfo.codeId = codigoId;
        }

        // Enhanced article scrolling and highlighting
        const articleId = searchParams.get('article');
        const shouldHighlight = searchParams.get('highlight') === 'true';
        const scrollType = searchParams.get('scroll') || 'start';
        
        if (articleId) {
          setTimeout(() => {
            const element = document.getElementById(`article-${articleId}`);
            if (element) {
              // Enhanced scroll behavior based on type
              const scrollOptions: ScrollIntoViewOptions = {
                behavior: 'smooth',
                block: scrollType === 'center' ? 'center' : 'start'
              };
              
              element.scrollIntoView(scrollOptions);
              
              // Enhanced highlighting if requested
              if (shouldHighlight) {
                element.classList.add('enhanced-highlight-article');
                setTimeout(() => {
                  element.classList.remove('enhanced-highlight-article');
                }, 3000);
              }
            } else {
              // If article not found on current page, try to find it in all articles
              console.log(`Article ${articleId} not found on current page, searching all pages...`);
              // This will trigger a search for the article across all pages
              findAndNavigateToArticle(articleId);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error("Failed to load articles:", error);
      setErrorMessage("Falha ao carregar artigos. Por favor, tente novamente.");
      setErrorDialogOpen(true);
      toast.error("Falha ao carregar artigos. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [codigoId, searchParams]);
  
  // Function to find and navigate to a specific article
  const findAndNavigateToArticle = useCallback(async (articleId: string) => {
    if (!codigoId) return;
    
    try {
      const tableName = tableNameMap[codigoId];
      if (tableName) {
        // Search for the article across all pages
        const results = await searchAllLegalCodes(articleId, [tableName], {
          searchContent: false,
          searchExplanations: false,
          searchExamples: false
        });
        
        if (results.length > 0 && results[0].articles.length > 0) {
          const foundArticle = results[0].articles.find(a => a.id?.toString() === articleId);
          if (foundArticle) {
            // Calculate which page this article would be on
            const allArticlesResult = await fetchLegalCode(tableName, 1, 1000); // Get a large number to find position
            const articleIndex = allArticlesResult.articles.findIndex(a => a.id?.toString() === articleId);
            if (articleIndex !== -1) {
              const targetPage = Math.ceil((articleIndex + 1) / ITEMS_PER_PAGE);
              console.log(`Found article on page ${targetPage}, loading that page...`);
              
              // Load the correct page
              await loadArticles(targetPage);
              setCurrentPage(targetPage);
              
              // Update URL without the article parameter to avoid infinite loop
              const newSearchParams = new URLSearchParams(searchParams.toString());
              newSearchParams.delete('article');
              newSearchParams.delete('highlight');
              newSearchParams.delete('scroll');
              setSearchParams(newSearchParams);
              
              // Scroll to article after page loads
              setTimeout(() => {
                const element = document.getElementById(`article-${articleId}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.classList.add('enhanced-highlight-article');
                  setTimeout(() => {
                    element.classList.remove('enhanced-highlight-article');
                  }, 3000);
                }
              }, 1000);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error finding article:", error);
    }
  }, [codigoId, loadArticles, searchParams, setSearchParams]);
  
  // Efeito para carregar artigos quando o código ou página mudar
  useEffect(() => {
    // Reset search and page when changing codes
    setSearchTerm("");
    setActiveTab("todos");
    setCurrentPage(1);
    setSearchResults([]);

    // Scroll to top when changing codes
    window.scrollTo(0, 0);
    
    loadArticles(1);
  }, [codigoId, loadArticles]);

  // Efeito para lidar com mudanças de página
  const handlePageChange = (page: number) => {
    // If searching, paginate through search results
    if (searchTerm.trim() !== "") {
      setCurrentPage(page);
      return;
    }
    
    // Otherwise load new page of articles
    setCurrentPage(page);
    loadArticles(page);
    
    // Scroll to top when changing page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect for searching across the entire database
  useEffect(() => {
    const searchArticles = async () => {
      const trimmedTerm = searchTerm.trim();
      console.log("Search effect triggered with term:", trimmedTerm);
      
      if (!codigoId || trimmedTerm.length < 1) {
        console.log("Clearing search results - no term or codigoId");
        setSearchResults([]);
        return;
      }

      // For article numbers (just digits), search immediately
      const isJustNumber = /^\d+[ºo°]?$/i.test(trimmedTerm);
      
      // UPDATED: Allow search with 1 character for both numbers and text
      if (trimmedTerm.length < 1) {
        console.log("Term too short for search:", trimmedTerm);
        return;
      }

      try {
        setSearching(true);
        console.log("Starting search for:", trimmedTerm, "in code:", codigoId);
        
        const tableName = tableNameMap[codigoId];
        
        if (tableName) {
          console.log("Using table:", tableName);
          
          const searchOptions = {
            searchContent: true, // Always search content
            searchExplanations: true, // Always search explanations
            searchExamples: true // Always search examples
          };
          
          console.log("Search options:", searchOptions);
          
          const results = await searchAllLegalCodes(trimmedTerm, [tableName], searchOptions);
          
          console.log("Search results:", results);
          
          // If results found for this code
          if (results.length > 0 && results[0].articles.length > 0) {
            console.log(`Found ${results[0].articles.length} articles`);
            setSearchResults(results[0].articles);
            setCurrentPage(1); // Reset to first page of search results
          } else {
            console.log("No results found");
            setSearchResults([]);
          }
        } else {
          console.log("No table name found for code:", codigoId);
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Erro ao realizar a busca. Por favor, tente novamente.");
      } finally {
        setSearching(false);
      }
    };

    // UPDATED: Immediate search for numbers, reduced debounce for text (200ms)
    const isJustNumber = /^\d+[ºo°]?$/i.test(searchTerm.trim());
    const delay = isJustNumber ? 0 : 200; // Immediate for numbers, 200ms for text
    
    const timeoutId = setTimeout(() => {
      searchArticles();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, codigoId]);

  // Handle search input change
  const handleSearchChange = (term: string) => {
    console.log("Search term changed to:", term);
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
    }
  };

  // Get the appropriate articles to display based on search, tab, and pagination
  const getDisplayArticles = () => {
    // UPDATED: If searching, use search results (removed length restriction)
    if (searchTerm.trim() !== "") {
      const filtered = searchResults.filter(article => {
        // If on "audio" tab, only show articles with audio comments
        if (activeTab === "audio") {
          return article.comentario_audio;
        }
        return true;
      });
      
      // Apply pagination to filtered search results
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return filtered.slice(startIndex, endIndex);
    }
    
    // Otherwise use regular articles
    return articles.filter(article => {
      // If on "audio" tab, only show articles with audio comments
      if (activeTab === "audio") {
        return article.comentario_audio;
      }
      return true;
    });
  };

  const displayArticles = getDisplayArticles();
  
  // Calculate total items for pagination
  const totalItems = searchTerm.trim() !== ""
    ? searchResults.filter(article => activeTab === "audio" ? article.comentario_audio : true).length
    : activeTab === "audio"
      ? articles.filter(article => article.comentario_audio).length
      : totalArticles;

  // Count articles with audio comments
  const audioCommentsCount = articles.filter(a => a.comentario_audio).length;

  if (!codigo) {
    return (
      <div className="min-h-screen flex flex-col dark">
        <Header />
        
        <main className="flex-1 container py-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-law-accent mb-4">Código não encontrado</h2>
          <Link to="/codigos" className="text-law-accent hover:underline">
            Voltar para lista de códigos
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 px-4 py-6">
        <CodeHeader title={codigo?.title} description={codigo?.description} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
          {/* Sidebar for larger screens */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="p-4 bg-background-dark rounded-md border border-gray-800">
                <h3 className="font-medium text-law-accent mb-4">Navegação</h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("todos")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Todos os Artigos</span>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("audio")}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>Com Comentários ({articles.filter(a => a.comentario_audio).length})</span>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start" onClick={() => document.getElementById('search-input')?.focus()}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>Pesquisar</span>
                  </Button>
                </div>
              </div>

              {articles.filter(a => a.comentario_audio).length > 0 && (
                <div className="p-4 bg-background-dark rounded-md border border-gray-800">
                  <CommentedArticlesMenu articles={articles} codeId={codigoId || ''} />
                </div>
              )}
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {/* Tabs for mobile */}
            <div className="lg:hidden mb-4">
              <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="todos" className="flex-1">Todos os Artigos</TabsTrigger>
                  <TabsTrigger value="audio" className="flex-1">
                    Com Comentários ({articles.filter(a => a.comentario_audio).length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <CodeSearch 
              searchTerm={searchTerm} 
              setSearchTerm={handleSearchChange}
              filteredArticles={displayArticles} 
              codigoId={codigoId}
              inputId="search-input"
              isSearching={searching}
            />
            
            {/* Articles section with improved loading state */}
            {(loading || searching) && <ArticlesLoading />}
            
            {!loading && !searching && displayArticles.length > 0 && (
              <div className="space-y-6 mt-6">
                {displayArticles.map(article => (
                  <div id={`article-${article.id}`} key={article.id}>
                    <ArticleView 
                      article={{
                        id: article.id?.toString() || '',
                        number: article.numero,
                        content: article.artigo,
                        explanation: article.tecnica,
                        formalExplanation: article.formal,
                        practicalExample: article.exemplo,
                        comentario_audio: article.comentario_audio
                      }} 
                    />
                  </div>
                ))}

                {/* Pagination */}
                <CodePagination 
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {!loading && !searching && displayArticles.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  {searchTerm.trim() !== "" 
                    ? `Nenhum artigo encontrado para "${searchTerm}"` 
                    : activeTab === "audio" 
                      ? "Não há artigos com comentários em áudio neste código." 
                      : "Não há artigos disponíveis neste código."
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Font Size Control */}
        <FontSizeControl 
          onIncrease={increaseFontSize} 
          onDecrease={decreaseFontSize} 
          currentSize={fontSize} 
          minSize={minFontSize} 
          maxSize={maxFontSize} 
        />

        {/* Scroll to top button */}
        <ScrollToTop show={showScrollTop} />

        {/* Error Dialog */}
        <ErrorDialog 
          open={errorDialogOpen} 
          onOpenChange={setErrorDialogOpen} 
          errorMessage={errorMessage} 
        />
      </main>

      {/* Enhanced highlight class for article scrolling */}
      <style>
        {`
        .highlight-article {
          animation: highlight-pulse 2s;
        }
        
        .enhanced-highlight-article {
          animation: enhanced-highlight-pulse 3s;
          border: 2px solid rgba(220, 38, 38, 0.5);
          background: rgba(220, 38, 38, 0.1);
        }
        
        @keyframes highlight-pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        
        @keyframes enhanced-highlight-pulse {
          0% { 
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
            background: rgba(220, 38, 38, 0.15);
          }
          50% { 
            box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
            background: rgba(220, 38, 38, 0.05);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
            background: rgba(220, 38, 38, 0.1);
          }
        }
        `}
      </style>
    </div>
  );
};

export default CodigoView;
