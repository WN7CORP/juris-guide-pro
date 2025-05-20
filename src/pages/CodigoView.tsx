
import { useParams, Link, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchLegalCode, fetchArticleById, LegalArticle } from "@/services/legalCodeService";
import { toast } from "sonner";
import { FontSizeControl } from "@/components/FontSizeControl";
import { useFontSize } from "@/hooks/useFontSize";
import CodeHeader from "@/components/CodeHeader";
import CodeSearch from "@/components/CodeSearch";
import ArticlesLoading from "@/components/ArticlesLoading";
import ErrorDialog from "@/components/ErrorDialog";
import ScrollToTop from "@/components/ScrollToTop";
import ArticleView from "@/components/ArticleView";
import CommentedArticlesMenu from "@/components/CommentedArticlesMenu";
import { tableNameMap } from "@/utils/tableMapping";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "@/utils/performance";

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string; }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const codigo = legalCodes.find(c => c.id === codigoId);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30; // Number of articles per page

  // Font size hook
  const { fontSize, increaseFontSize, decreaseFontSize, minFontSize, maxFontSize } = useFontSize();
  
  // Get the article ID from URL if present
  const articleId = searchParams.get('article');
  const tableName = codigoId ? tableNameMap[codigoId] : undefined;

  // Fetch articles with React Query for automatic caching
  const {
    data: articlesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['legalCode', codigoId, currentPage, pageSize],
    queryFn: async () => {
      if (!codigoId || !tableName) {
        return { articles: [], totalCount: 0 };
      }
      return await fetchLegalCode(tableName as any, currentPage, pageSize);
    },
    enabled: !!codigoId && !!tableName,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch single article if articleId is in URL
  const {
    data: singleArticle,
    isLoading: isSingleArticleLoading
  } = useQuery({
    queryKey: ['article', codigoId, articleId],
    queryFn: async () => {
      if (!codigoId || !tableName || !articleId) return null;
      return await fetchArticleById(tableName as any, articleId);
    },
    enabled: !!codigoId && !!tableName && !!articleId,
    staleTime: 5 * 60 * 1000,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Failed to load articles:", error);
      setErrorMessage("Falha ao carregar artigos. Por favor, tente novamente.");
      setErrorDialogOpen(true);
      toast.error("Falha ao carregar artigos. Por favor, tente novamente.");
    }
  }, [error]);

  // Scroll to article if articleId is in URL
  useEffect(() => {
    if (articleId && !isLoading && !isSingleArticleLoading) {
      setTimeout(() => {
        const element = document.getElementById(`article-${articleId}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          // Highlight the element temporarily
          element.classList.add('highlight-article');
          setTimeout(() => {
            element.classList.remove('highlight-article');
          }, 2000);
        }
      }, 500);
    }
  }, [articleId, isLoading, isSingleArticleLoading]);

  // Update global state with code ID for proper navigation from player
  useEffect(() => {
    if (codigoId && globalAudioState.minimalPlayerInfo) {
      globalAudioState.minimalPlayerInfo.codeId = codigoId;
    }
  }, [codigoId]);

  // Reset search and scroll to top when changing codes
  useEffect(() => {
    setSearchTerm("");
    setCurrentPage(1);
    window.scrollTo(0, 0);
  }, [codigoId]);

  // Show/hide scroll to top button
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

  // Efficiently filter articles with useMemo
  const filteredArticles = useMemo(() => {
    const articles = articlesData?.articles || [];
    if (!searchTerm) return articles;
    
    const searchLower = searchTerm.toLowerCase();
    return articles.filter(article => {
      return (article.numero && article.numero.toLowerCase().includes(searchLower)) 
          || article.artigo.toLowerCase().includes(searchLower);
    });
  }, [articlesData?.articles, searchTerm]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!articlesData?.totalCount) return 1;
    return Math.ceil(articlesData.totalCount / pageSize);
  }, [articlesData?.totalCount, pageSize]);

  // Debounced search handler
  const handleSearchChange = useCallback(debounce((value: string) => {
    setSearchTerm(value);
    if (currentPage !== 1) setCurrentPage(1);
  }, 300), [currentPage]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  // Show 404 if codigo not found
  if (!codigo) {
    return <div className="min-h-screen flex flex-col dark">
        <Header />
        
        <main className="flex-1 container py-6 pb-20 md:pb-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-law-accent mb-4">Código não encontrado</h2>
          <Link to="/codigos" className="text-law-accent hover:underline">
            Voltar para lista de códigos
          </Link>
        </main>
        
        <MobileFooter />
      </div>;
  }
  
  // Render main content
  return <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 md:px-4 my-0 mx-0 px-[10px] py-[8px]">
        <CodeHeader title={codigo?.title} description={codigo?.description} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-3">
            <CodeSearch 
              searchTerm={searchTerm} 
              setSearchTerm={(value) => handleSearchChange(value)} 
              filteredArticles={filteredArticles} 
              codigoId={codigoId} 
            />
            
            {/* Articles section with improved loading state */}
            {(isLoading || isSingleArticleLoading) && <ArticlesLoading />}
            
            {/* Single article view */}
            {!isLoading && !isSingleArticleLoading && articleId && singleArticle && (
              <div className="space-y-6 mt-6">
                <div id={`article-${singleArticle.id}`}>
                  <ArticleView article={{
                    id: singleArticle.id?.toString() || '',
                    number: singleArticle.numero,
                    content: singleArticle.artigo,
                    explanation: singleArticle.tecnica,
                    formalExplanation: singleArticle.formal,
                    practicalExample: singleArticle.exemplo,
                    comentario_audio: singleArticle.comentario_audio
                  }} />
                </div>
              </div>
            )}
            
            {/* Articles list view */}
            {!isLoading && !isSingleArticleLoading && !articleId && filteredArticles.length > 0 && (
              <div className="space-y-6 mt-6">
                {filteredArticles.map(article => (
                  <div id={`article-${article.id}`} key={article.id}>
                    <ArticleView article={{
                      id: article.id?.toString() || '',
                      number: article.numero,
                      content: article.artigo,
                      explanation: article.tecnica,
                      formalExplanation: article.formal,
                      practicalExample: article.exemplo,
                      comentario_audio: article.comentario_audio
                    }} />
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && !searchTerm && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }} 
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              href="#" 
                              isActive={pageNum === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNum);
                              }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}

            {!isLoading && !isSingleArticleLoading && filteredArticles.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-400">Nenhum artigo encontrado para "{searchTerm}"</p>
                {searchTerm && (
                  <button 
                    className="mt-4 text-law-accent hover:underline"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar pesquisa
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar for articles with audio comments */}
          <div className="hidden lg:block">
            <div className="p-4 bg-background-dark rounded-md border border-gray-800 sticky top-24">
              <CommentedArticlesMenu 
                articles={articlesData?.articles || []} 
                codeId={codigoId || ''} 
              />
            </div>
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
      
      <MobileFooter />

      {/* Add highlight class for article scrolling */}
      <style>
        {`
        .highlight-article {
          animation: highlight-pulse 2s;
        }
        
        @keyframes highlight-pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        `}
      </style>
    </div>;
};
export default CodigoView;
