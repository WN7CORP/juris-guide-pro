
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
          const data = await fetchLegalCode(tableName as any);
          
          // Log data to help debug
          console.log(`Loaded ${data.length} articles for ${tableName}`);
          const articlesWithAudio = data.filter(a => a.comentario_audio);
          console.log(`Articles with audio: ${articlesWithAudio.length}`);
          
          if (articlesWithAudio.length > 0) {
            console.log("First article with audio:", articlesWithAudio[0]);
          }
          
          setArticles(data);
          
          // If we have an article parameter, find and select that article
          if (articleParam) {
            const foundArticle = data.find(article => article.id?.toString() === articleParam);
            if (foundArticle) {
              setSelectedArticle(foundArticle);
              // Scroll to the article after a short delay to allow the DOM to update
              setTimeout(() => {
                const element = document.getElementById(`article-${foundArticle.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 500);
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

    const loadArticlesWithAudio = async () => {
      if (!codigoId) return;
      try {
        setLoadingAudio(true);
        const tableName = tableNameMap[codigoId];
        
        if (tableName) {
          const audioArticles = await fetchArticlesWithAudioComments(tableName as any);
          setArticlesWithAudio(audioArticles);
          console.log(`Loaded ${audioArticles.length} articles with audio for ${tableName}`);
        }
      } catch (error) {
        console.error("Failed to load audio articles:", error);
        // Don't show an error dialog for this, as it's not critical
      } finally {
        setLoadingAudio(false);
      }
    };
    
    loadArticles();
    loadArticlesWithAudio();
    
    // Reset search when changing codes
    setSearchTerm("");
    setSelectedArticle(null);
    
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

  // Filter articles based on search term
  const filteredArticles = searchTerm ? 
    articles.filter(article => {
      const searchLower = searchTerm.toLowerCase();
      return (
        article.numero && article.numero.toLowerCase().includes(searchLower) || 
        article.artigo.toLowerCase().includes(searchLower)
      );
    }) : 
    selectedArticle ? [selectedArticle] : articles;

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

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-28 md:pb-6 py-4 mx-auto px-3 md:px-4">
        <CodeHeader 
          title={codigo?.title} 
          description={codigo?.description} 
        />

        {/* Commented Articles Menu */}
        {!loadingAudio && articlesWithAudio.length > 0 && (
          <CommentedArticlesMenu 
            articles={articlesWithAudio} 
            title={codigo?.title || ''} 
          />
        )}
        
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
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-400">Nenhum artigo encontrado para "{searchTerm}"</p>
          </div>
        )}

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
