
import { useParams, Link, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { useState, useEffect } from "react";
import { fetchLegalCode, LegalArticle } from "@/services/legalCodeService";
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
import { useViewHistory } from "@/hooks/useViewHistory";

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const codigo = legalCodes.find(c => c.id === codigoId);
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // View history hook
  const { addToHistory } = useViewHistory();
  
  // Font size hook
  const { fontSize, increaseFontSize, decreaseFontSize, minFontSize, maxFontSize } = useFontSize();

  useEffect(() => {
    const loadArticles = async () => {
      if (!codigoId) return;
      try {
        setLoading(true);
        const tableName = tableNameMap[codigoId];
        if (tableName) {
          const data = await fetchLegalCode(tableName);
          
          // Log data to help debug
          console.log(`Loaded ${data.length} articles for ${tableName}`);
          console.log("Articles with audio:", data.filter(a => a.comentario_audio).length);
          
          setArticles(data);
          
          // If there's an article ID in the URL, scroll to it
          const articleId = searchParams.get('article');
          if (articleId) {
            setTimeout(() => {
              const element = document.getElementById(`article-${articleId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight the element temporarily
                element.classList.add('highlight-article');
                setTimeout(() => {
                  element.classList.remove('highlight-article');
                }, 2000);
              }
            }, 500);
          }
          
          // Add to view history if we have a valid code
          if (codigo) {
            addToHistory({
              id: codigoId,
              title: codigo.title,
              path: `/codigos/${codigoId}`
            });
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
    };
    loadArticles();
    
    // Reset search when changing codes
    setSearchTerm("");
    
    // Scroll to top when changing codes
    window.scrollTo(0, 0);
  }, [codigoId, searchParams, addToHistory, codigo]);

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

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => {
    const searchLower = searchTerm.toLowerCase();
    return (
      article.numero && article.numero.toLowerCase().includes(searchLower) || 
      article.artigo.toLowerCase().includes(searchLower)
    );
  });

  if (!codigo) {
    return (
      <div className="min-h-screen flex flex-col dark">
        <Header />
        
        <main className="flex-1 container py-6 pb-20 md:pb-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-law-accent mb-4">Código não encontrado</h2>
          <Link to="/codigos" className="text-law-accent hover:underline">
            Voltar para lista de códigos
          </Link>
        </main>
        
        <MobileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 py-4 mx-auto px-3 md:px-4">
        <CodeHeader 
          title={codigo?.title} 
          description={codigo?.description} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-3">
            <CodeSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredArticles={filteredArticles}
              codigoId={codigoId}
            />
            
            {/* Articles section with improved loading state */}
            {loading && <ArticlesLoading />}
            
            {!loading && filteredArticles.length > 0 && (
              <div className="space-y-6 mt-6">
                {filteredArticles.map(article => (
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
              </div>
            )}

            {!loading && filteredArticles.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-400">Nenhum artigo encontrado para "{searchTerm}"</p>
              </div>
            )}
          </div>
          
          {/* Sidebar for articles with audio comments */}
          <div className="hidden lg:block">
            <div className="p-4 bg-background-dark rounded-md border border-gray-800 sticky top-24">
              <CommentedArticlesMenu 
                articles={articles} 
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
    </div>
  );
};

export default CodigoView;
