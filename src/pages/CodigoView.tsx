import { useParams, Link } from "react-router-dom";
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
  const codigo = legalCodes.find(c => c.id === codigoId);
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  
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
          
          // Better logging for audio comments
          console.log(`Loaded ${data.length} articles for ${tableName}`);
          
          // Special handling for Código Penal
          if (codigoId === "codigo-penal") {
            console.log("DETAILED ANALYSIS FOR CÓDIGO PENAL:");
            
            // Check both audio fields
            const withCommentarioAudio = data.filter(a => a.comentario_audio).length;
            const withArtigoAudio = data.filter(a => a.artigo_audio).length;
            
            console.log(`Articles with comentario_audio: ${withCommentarioAudio}`);
            console.log(`Articles with artigo_audio: ${withArtigoAudio}`);
            
            // Log the first few articles to check for audio comments
            console.log("Sample articles with audio fields:");
            const articlesWithAnyAudio = data.filter(a => a.comentario_audio || a.artigo_audio);
            
            if (articlesWithAnyAudio.length > 0) {
              articlesWithAnyAudio.slice(0, 3).forEach((article, index) => {
                console.log(`Audio article ${index + 1}:`, {
                  id: article.id,
                  numero: article.numero,
                  hasCommentarioAudio: !!article.comentario_audio,
                  hasArtigoAudio: !!article.artigo_audio,
                  commentarioAudioUrl: article.comentario_audio,
                  artigoAudioUrl: article.artigo_audio
                });
              });
            } else {
              console.warn("WARNING: No articles with any audio found in Código Penal.");
            }
          }
          
          setArticles(data);
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
  }, [codigoId]);

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

  // Debug if we're on the Código Penal page
  useEffect(() => {
    if (codigoId === "codigo-penal") {
      console.log("Currently viewing Código Penal");
      console.log("Articles with audio:", articles.filter(a => a.comentario_audio).length);
      
      // Log the first few articles to check for audio comments
      const articlesWithAudio = articles.filter(a => a.comentario_audio);
      console.log(`Found ${articlesWithAudio.length} articles with audio`);
      
      if (articlesWithAudio.length > 0) {
        articlesWithAudio.slice(0, 3).forEach((article, index) => {
          console.log(`Audio article ${index + 1}:`, {
            id: article.id,
            numero: article.numero,
            hasAudio: !!article.comentario_audio,
            audioUrl: article.comentario_audio
          });
        });
      } else {
        console.warn("WARNING: No articles with audio comments found. Check database columns.");
      }
    }
  }, [codigoId, articles]);

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
            {filteredArticles.map(article => {
              // Enhanced debug logging for each article with audio
              if (article.comentario_audio || article.artigo_audio) {
                console.log(`Rendering article ${article.numero || article.id} with:`, {
                  hasCommentarioAudio: !!article.comentario_audio,
                  hasArtigoAudio: !!article.artigo_audio,
                  commentarioAudio: article.comentario_audio,
                  artigoAudio: article.artigo_audio
                });
              }
              
              return (
                <ArticleView 
                  key={article.id} 
                  article={{
                    id: article.id?.toString() || '',
                    number: article.numero,
                    content: article.artigo,
                    explanation: article.tecnica,
                    formalExplanation: article.formal,
                    practicalExample: article.exemplo,
                    comentario_audio: article.comentario_audio || article.artigo_audio // Use either audio field
                  }} 
                />
              );
            })}
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
      
      <MobileFooter />
    </div>
  );
};

export default CodigoView;
