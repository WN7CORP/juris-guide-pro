import { useParams, Link, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { fetchLegalCode, LegalArticle, fetchArticlesWithAudioComments } from "@/services/legalCodeService";
import { toast } from "sonner";
import { FontSizeControl } from "@/components/FontSizeControl";
import { useFontSize } from "@/hooks/useFontSize";
import CodeHeader from "@/components/CodeHeader";
import CodeSearch from "@/components/CodeSearch";
import ArticlesLoading from "@/components/ArticlesLoading";
import ErrorDialog from "@/components/ErrorDialog";
import ScrollToTop from "@/components/ScrollToTop";
import ArticleView from "@/components/ArticleView";
import { FloatingMenu } from "@/components/FloatingMenu";
import { CommentedArticlesMenu } from "@/components/CommentedArticlesMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define a mapping from URL parameters to actual table names
const tableNameMap: Record<string, any> = {
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
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [articlesWithAudio, setArticlesWithAudio] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<LegalArticle | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Font size hook
  const { fontSize, increaseFontSize, decreaseFontSize, minFontSize, maxFontSize } = useFontSize();

  useEffect(() => {
    const loadArticles = async () => {
      if (!codigoId) return;
      try {
        setLoading(true);
        const tableName = tableNameMap[codigoId];
        console.log(`Loading articles for ${codigoId} from table ${tableName}`);
        
        if (tableName) {
          // Use Promise.all to fetch articles and audio comments in parallel
          const [data, audioArticles] = await Promise.all([
            fetchLegalCode(tableName as any),
            fetchArticlesWithAudioComments(tableName as any)
          ]);
          
          // Log data to help debug
          console.log(`Loaded ${data.length} articles for ${tableName}`);
          console.log(`Loaded ${audioArticles.length} articles with audio for ${tableName}`);
          
          setArticles(data);
          setArticlesWithAudio(audioArticles);
          
          // If we have an article parameter, find and select that article
          if (articleParam) {
            const foundArticle = data.find(article => article.id?.toString() === articleParam);
            if (foundArticle) {
              setSelectedArticle(foundArticle);
              // Reset the active tab to show the selected article
              setActiveTab("all");
              // Scroll to the article after a short delay to allow the DOM to update
              requestAnimationFrame(() => {
                const element = document.getElementById(`article-${foundArticle.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              });
            } else {
              toast.error("Artigo não encontrado");
            }
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
    
    // Reset search and selected article when changing codes
    setSearchTerm("");
    setSelectedArticle(null);
    setActiveTab("all");
    
    // Scroll to top when changing codes
    window.scrollTo(0, 0);
  }, [codigoId, articleParam]);

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
  const getFilteredArticles = () => {
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
    if (selectedArticle && activeTab !== "commented") {
      return [selectedArticle];
    }
    
    // If we're on the commented tab, show only articles with audio
    if (activeTab === "commented") {
      return articlesWithAudio;
    }
    
    // Otherwise, show all articles
    return articles;
  };
  
  const filteredArticles = getFilteredArticles();

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

  // Modify the articles section to optimize rendering
  const renderArticles = () => {
    if (loading) {
      return <ArticlesLoading />;
    }
    
    if (filteredArticles.length === 0) {
      return (
        <div className="mt-8 text-center">
          <p className="text-gray-400">Nenhum artigo encontrado para "{searchTerm}"</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6 mt-6">
        {filteredArticles.map(article => (
          <ArticleView 
            key={article.id} 
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
        ))}
      </div>
    );
  };
  
  return (
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
                disabled={articlesWithAudio.length === 0}
              >
                Artigos Comentados <span className="ml-1 text-xs bg-law-accent/20 text-law-accent px-1.5 py-0.5 rounded-full">{articlesWithAudio.length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Search Bar */}
        <CodeSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredArticles={filteredArticles}
          codigoId={codigoId}
        />
        
        {/* Commented Articles Menu */}
        {!loadingAudio && articlesWithAudio.length > 0 && (
          <CommentedArticlesMenu 
            articles={articlesWithAudio} 
            title={codigo?.title || ''} 
          />
        )}
        
        {/* Articles section with improved rendering */}
        {renderArticles()}

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
  );
};

export default CodigoView;
