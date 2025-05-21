
import { useParams, Link, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
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
import ArticleView from "@/components/article/ArticleView";
import CommentedArticlesMenu from "@/components/CommentedArticlesMenu";
import { tableNameMap } from "@/utils/tableMapping";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Button } from "@/components/ui/button";
import { BookOpen, Info, Search } from "lucide-react";
import { preloadAudioBatch } from "@/services/audioPreloadService";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("todos");

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

          // Pre-load all audio files for faster playback
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

          // If there's an article ID in the URL, scroll to it
          const articleId = searchParams.get('article');
          if (articleId) {
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
    setActiveTab("todos");

    // Scroll to top when changing codes
    window.scrollTo(0, 0);
  }, [codigoId, searchParams]);
  
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

  // Filter articles based on search term and active tab
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === "" || 
      (article.numero && article.numero.toLowerCase().includes(searchTerm.toLowerCase())) || 
      article.artigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If on "audio" tab, only show articles with audio comments
    if (activeTab === "audio") {
      return matchesSearch && article.comentario_audio;
    }
    
    return matchesSearch;
  });

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
                    <span>Com Comentários ({audioCommentsCount})</span>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start" onClick={() => document.getElementById('search-input')?.focus()}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>Pesquisar</span>
                  </Button>
                </div>
              </div>

              {audioCommentsCount > 0 && (
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
                    Com Comentários ({audioCommentsCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <CodeSearch 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              filteredArticles={filteredArticles} 
              codigoId={codigoId}
              inputId="search-input"
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
                <p className="text-gray-400">
                  {searchTerm 
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
