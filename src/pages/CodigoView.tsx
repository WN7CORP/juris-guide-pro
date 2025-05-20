import { useParams, Link, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { FontSizeControl } from "@/components/FontSizeControl";
import { useFontSize } from "@/hooks/useFontSize";
import CodeHeader from "@/components/CodeHeader";
import CodeSearch from "@/components/CodeSearch";
import ArticlesLoading from "@/components/ArticlesLoading";
import ErrorDialog from "@/components/ErrorDialog";
import ScrollToTop from "@/components/ScrollToTop";
import { FloatingMenu } from "@/components/FloatingMenu";
import VirtualizedArticleList from "@/components/VirtualizedArticleList";
import { useLegalArticlesStore } from "@/store/legalArticlesStore";
import { AudioProvider } from "@/contexts/AudioContext";
import { LegalArticle, LegalCodeTable } from "@/services/legalCodeService";
import { Volume } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define a mapping from URL parameters to actual table names
const tableNameMap: Record<string, LegalCodeTable> = {
  "codigo-civil": "Código_Civil",
  "codigo-penal": "Código_Penal",
  "codigo-processo-civil": "Código_de_Processo_Civil",
  "codigo-processo-penal": "Código_de_Processo_Penal",
  "codigo-tributario": "Código_Tributário_Nacional",
  "codigo-defesa-consumidor": "Código_de_Defesa_do_Consumidor",
  "codigo-transito": "Código_de_Trânsito_Brasileiro",
  "codigo-eleitoral": "Código_Eleitoral",
  "constituicao-federal": "Constituicao_Federal"
};

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string }>();
  const [searchParams] = useSearchParams();
  const articleParam = searchParams.get('article');
  
  const codigo = legalCodes.find(c => c.id === codigoId);
  const [loading, setLoading] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Font size hook
  const { fontSize, increaseFontSize, decreaseFontSize, minFontSize, maxFontSize } = useFontSize();

  // Get articles from our store
  const { 
    getArticles, 
    getArticlesWithAudio, 
    getCachedArticles,
    getCachedArticlesWithAudio,
    setSelectedArticle
  } = useLegalArticlesStore();
  
  // State for articles in memory
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [articlesWithAudio, setArticlesWithAudio] = useState<LegalArticle[]>([]);
  
  // Get table name from URL parameter
  const tableName = useMemo(() => {
    if (!codigoId) return "" as LegalCodeTable;
    return tableNameMap[codigoId] || "" as LegalCodeTable;
  }, [codigoId]);

  // Load articles when tableName changes
  useEffect(() => {
    if (!tableName) return;
    
    const loadArticles = async () => {
      try {
        setLoading(true);
        setLoadingAudio(true);
        
        // Check cache first
        const cachedArticles = getCachedArticles(tableName);
        const cachedAudioArticles = getCachedArticlesWithAudio(tableName);
        
        // If we have cached data, use it immediately
        if (cachedArticles) {
          setArticles(cachedArticles);
          setLoading(false);
        }

        if (cachedAudioArticles) {
          setArticlesWithAudio(cachedAudioArticles);
          setLoadingAudio(false);
        }
        
        // Always fetch fresh data in background
        const [freshArticles, freshAudioArticles] = await Promise.all([
          getArticles(tableName),
          getArticlesWithAudio(tableName)
        ]);
        
        setArticles(freshArticles);
        setArticlesWithAudio(freshAudioArticles);
        
        // Log audio article count for debugging
        console.log(`Loaded ${freshAudioArticles.length} articles with audio for ${tableName}`);
        
        // If we have an article parameter, update the selected article
        if (articleParam) {
          const foundArticle = freshArticles.find(article => article.id?.toString() === articleParam);
          if (foundArticle) {
            setSelectedArticle(articleParam);
            // Reset the active tab to show the selected article
            setActiveTab("all");
          } else {
            toast.error("Artigo não encontrado");
          }
        }
      } catch (error) {
        console.error("Failed to load articles:", error);
        setErrorMessage("Falha ao carregar artigos. Por favor, tente novamente.");
        setErrorDialogOpen(true);
        toast.error("Falha ao carregar artigos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
        setLoadingAudio(false);
      }
    };
    
    loadArticles();
    
    // Reset search and selected article when changing codes
    setSearchTerm("");
    setActiveTab("all");
    
    // Scroll to top when changing codes
    window.scrollTo(0, 0);
  }, [tableName, articleParam, getArticles, getArticlesWithAudio, getCachedArticles, getCachedArticlesWithAudio, setSelectedArticle]);

  // Scroll to top button logic
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

  // Filter articles based on active tab and search term
  const filteredArticles = useMemo(() => {
    // If there's a search term, filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return articles.filter(article => {
        return (
          article.numero && article.numero.toLowerCase().includes(searchLower) || 
          article.artigo.toLowerCase().includes(searchLower)
        );
      });
    }

    // If there's a selected article and we're not on the commented tab, show only that
    if (articleParam && activeTab !== "commented") {
      const selectedArticle = articles.find(article => article.id?.toString() === articleParam);
      return selectedArticle ? [selectedArticle] : [];
    }
    
    // Otherwise, show all articles
    return articles;
  }, [articles, searchTerm, articleParam, activeTab]);

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
        
        <FloatingMenu />
      </div>
    );
  }

  // Create a standalone Artigos Comentados button
  const ArticlesCommentedButton = () => (
    <Button 
      variant="outline" 
      className="gap-2 flex items-center text-law-accent border-law-accent hover:bg-law-accent/10 my-4"
      onClick={() => setActiveTab("commented")}
    >
      <Volume className="h-5 w-5" />
      <span>Ver Artigos Comentados</span>
      <span className="text-xs bg-law-accent/20 text-law-accent px-1.5 py-0.5 rounded-full">
        {articlesWithAudio.length}
      </span>
    </Button>
  );

  // Render articles or audio playlist based on the active tab
  const renderContent = () => {
    if (loading && activeTab === "all") {
      return <ArticlesLoading />;
    }
    
    if (loadingAudio && activeTab === "commented") {
      return <div className="flex justify-center my-8">
        <div className="h-8 w-8 border-2 border-law-accent border-t-transparent rounded-full animate-spin"></div>
      </div>;
    }
    
    if (activeTab === "commented") {
      // Show audio playlist for the commented tab
      return (
        <AudioCommentPlaylist 
          articles={articlesWithAudio} 
          title={codigo.title} 
          currentArticleId={articleParam || undefined} 
        />
      );
    } else {
      // Show filtered articles for the all tab
      if (filteredArticles.length === 0) {
        return (
          <div className="mt-8 text-center">
            <p className="text-gray-400">Nenhum artigo encontrado para "{searchTerm}"</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-6 mt-6">
          <VirtualizedArticleList 
            articles={filteredArticles}
            selectedArticleId={articleParam || undefined}
          />
        </div>
      );
    }
  };
  
  return (
    <AudioProvider>
      <div className="min-h-screen flex flex-col dark">
        <Header />
        
        <main className="flex-1 container pb-28 md:pb-6 py-4 mx-auto px-3 md:px-4">
          <CodeHeader 
            title={codigo?.title} 
            description={codigo?.description} 
          />

          {/* Filter Tabs */}
          <div className="mt-6 mb-4">
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="tabs-netflix"
            >
              <TabsList className="bg-background-dark border border-gray-800 w-full sm:w-auto">
                <TabsTrigger 
                  value="all"
                  className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                >
                  Todos os Artigos
                </TabsTrigger>
                <TabsTrigger 
                  value="commented"
                  className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                >
                  Artigos Comentados <span className="ml-1 text-xs bg-law-accent/20 text-law-accent px-1.5 py-0.5 rounded-full">{articlesWithAudio.length}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Search Bar - only show when on 'all' tab */}
          {activeTab === "all" && (
            <CodeSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredArticles={filteredArticles}
              codigoId={codigoId}
            />
          )}
          
          {/* Prominent Artigos Comentados Button - always visible */}
          <div className="flex justify-center">
            <ArticlesCommentedButton />
          </div>
          
          {/* CommentedArticlesMenu - always shown for visibility */}
          <CommentedArticlesMenu 
            articles={articlesWithAudio} 
            title={codigo?.title || ''} 
            autoOpen={false}
          />
          
          {/* Render content based on active tab */}
          {renderContent()}

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
        
        <FloatingMenu />
      </div>
    </AudioProvider>
  );
};

export default CodigoView;
